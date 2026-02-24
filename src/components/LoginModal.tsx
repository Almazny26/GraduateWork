import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'

import photoMiniImg from '@/assets/photo_mini.png'

type Props = { open: boolean; onClose: () => void }
type AuthMode = 'login' | 'register'

function toRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) return null
  return value as Record<string, unknown>
}

function collectNestedRecords(root: unknown): Record<string, unknown>[] {
  const first = toRecord(root)
  if (!first) return []

  const keysToDive = ['user', 'data', 'result', 'payload']
  const queue: Record<string, unknown>[] = [first]
  const result: Record<string, unknown>[] = []
  const seen = new Set<Record<string, unknown>>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || seen.has(current)) continue
    seen.add(current)
    result.push(current)

    keysToDive.forEach((key) => {
      const nested = toRecord(current[key])
      if (nested) queue.push(nested)
    })
  }

  return result
}

function extractApiEmail(payload: unknown): string {
  const records = collectNestedRecords(payload)
  for (const record of records) {
    if (typeof record.email === 'string') return record.email
  }
  return ''
}

function parseAuthIdentity(email: unknown) {
  if (typeof email !== 'string') {
    return { email: '', login: 'user' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { email: '', login: 'user' }
  }

  const loginFromEmail = normalizedEmail.split('@')[0] || 'user'
  return { email: normalizedEmail, login: loginFromEmail }
}

function normalizeSelectedCourseIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []

  const ids = raw
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (typeof item !== 'object' || item === null) return ''

      const record = item as Record<string, unknown>
      const candidate =
        (typeof record._id === 'string' && record._id) ||
        (typeof record.courseId === 'string' && record.courseId) ||
        (typeof record.id === 'string' && record.id) ||
        ''

      return candidate.trim()
    })
    .filter(Boolean)

  return Array.from(new Set(ids))
}

function extractSelectedCourses(payload: unknown): string[] {
  const records = collectNestedRecords(payload)
  for (const record of records) {
    const fromSelectedCourses = normalizeSelectedCourseIds(record.selectedCourses)
    if (fromSelectedCourses.length > 0) return fromSelectedCourses
  }
  for (const record of records) {
    const fromCourses = normalizeSelectedCourseIds(record.courses)
    if (fromCourses.length > 0) return fromCourses
  }
  return []
}

export function LoginModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [shouldRender, setShouldRender] = useState(open)
  const [isVisible, setIsVisible] = useState(false)
  const [mode, setMode] = useState<AuthMode>('login')
  const [loginValue, setLoginValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterRepeatPassword, setShowRegisterRepeatPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const clearFormState = () => {
    setLoginValue('')
    setEmailValue('')
    setPassword('')
    setRepeatPassword('')
    setShowLoginPassword(false)
    setShowRegisterPassword(false)
    setShowRegisterRepeatPassword(false)
    setLoginError('')
    setRegisterError('')
    setIsLoginSubmitting(false)
    setIsRegisterSubmitting(false)
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setLoginError('')
    setRegisterError('')
  }

  useEffect(() => {
    if (open) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      setShouldRender(true)
      clearFormState()
      setMode('login')
      const raf = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(raf)
    }

    setIsVisible(false)
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false)
      closeTimerRef.current = null
    }, 240)
  }, [open])

  useEffect(() => {
    if (!shouldRender) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [shouldRender, onClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoginSubmitting) return
    setLoginError('')
    const email = loginValue.trim().toLowerCase()
    const pass = password.trim()

    if (!email || !pass) {
      setLoginError('Заполните все поля.')
      return
    }

    setIsLoginSubmitting(true)
    try {
      const { token } = await fitnessApi.login(email, pass)
      const me = await fitnessApi.me(token)
      const identity = parseAuthIdentity(extractApiEmail(me))
      login(
        {
          name: identity.login,
          login: identity.login,
          email: identity.email,
          selectedCourses: extractSelectedCourses(me),
          avatarUrl: photoMiniImg,
        },
        token,
      )
      clearFormState()
      onClose()
      navigate('/profile')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Ошибка авторизации')
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegisterSubmitting) return
    setRegisterError('')
    const email = emailValue.trim().toLowerCase()
    const pass = password.trim()
    const passRepeat = repeatPassword.trim()

    if (!email || !pass || !passRepeat) {
      setRegisterError('Заполните все поля.')
      return
    }
    if (pass !== passRepeat) {
      setRegisterError('Пароли не совпадают.')
      return
    }

    setIsRegisterSubmitting(true)
    try {
      await fitnessApi.register(email, pass)
      const { token } = await fitnessApi.login(email, pass)
      const me = await fitnessApi.me(token)
      const identity = parseAuthIdentity(extractApiEmail(me))
      login(
        {
          name: identity.login,
          login: identity.login,
          email: identity.email,
          selectedCourses: extractSelectedCourses(me),
          avatarUrl: photoMiniImg,
        },
        token,
      )
      clearFormState()
      onClose()
      navigate('/profile')
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Ошибка регистрации')
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const inputClassName = (hasError: boolean) =>
    `w-full h-[52px] rounded-[8px] border bg-white px-4 text-[18px] leading-[1.1] text-black placeholder:text-black/25 outline-none ${
      hasError ? 'border-[#FF4D6D]' : 'border-[#D0D0D0]'
    }`

  const renderPasswordInput = ({
    value,
    onChange,
    placeholder,
    hasError,
    showValue,
    onToggleShow,
    autoComplete,
    disabled,
  }: {
    value: string
    onChange: (value: string) => void
    placeholder: string
    hasError: boolean
    showValue: boolean
    onToggleShow: () => void
    autoComplete: string
    disabled: boolean
  }) => (
    <div className="relative w-full">
      {!showValue && value.length > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 right-[48px] top-1/2 -translate-y-1/2 overflow-hidden whitespace-nowrap text-[18px] leading-[1.1] text-black"
          style={{ fontFamily: 'Roboto, sans-serif', letterSpacing: 0 }}
        >
          {'*'.repeat(value.length)}
        </span>
      )}
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClassName(hasError)} pr-[48px]`}
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontSize: 18,
          color: showValue ? 'rgba(0, 0, 0, 1)' : 'transparent',
          caretColor: 'rgba(0, 0, 0, 1)',
        }}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={onToggleShow}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-[#7A7A7A] hover:text-black transition-colors disabled:opacity-60"
        aria-label={showValue ? 'Скрыть пароль' : 'Показать пароль'}
      >
        {showValue ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M3 3L21 21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M9.9 9.9C9.39 10.41 9.08 11.12 9.08 11.9C9.08 13.45 10.35 14.72 11.9 14.72C12.68 14.72 13.39 14.41 13.9 13.9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.56 6.56C4.74 7.79 3.41 9.67 2.7 12C4.04 16.4 7.67 19 12 19C13.88 19 15.63 18.51 17.18 17.62"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10.73 5.08C11.14 5.03 11.56 5 12 5C16.33 5 19.96 7.6 21.3 12C20.83 13.54 20.06 14.89 19.08 16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <path
              d="M2.7 12C4.04 7.6 7.67 5 12 5C16.33 5 19.96 7.6 21.3 12C19.96 16.4 16.33 19 12 19C7.67 19 4.04 16.4 2.7 12Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  )

  if (!shouldRender) return null

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className={`relative w-full rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        }`}
        style={{
          width: 'min(343px, calc(100vw - 24px))',
          height: mode === 'register' ? 487 : 425,
          padding: 40,
          gap: 48,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/images/logo.svg"
          alt="SkyFitnessPro"
          width={220}
          height={35}
          className="mx-auto h-[35px] w-full max-w-[220px] object-contain"
        />

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="w-[280px] flex flex-col gap-[10px]">
            <input
              id="login-title"
              type="email"
              value={loginValue}
              disabled={isLoginSubmitting}
              onChange={(e) => {
                setLoginValue(e.target.value)
                if (loginError) setLoginError('')
              }}
              placeholder="Эл. почта"
              className={inputClassName(false)}
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
              autoComplete="email"
            />
            {renderPasswordInput({
              value: password,
              onChange: (nextValue) => {
                setPassword(nextValue)
                if (loginError) setLoginError('')
              },
              placeholder: 'Пароль',
              hasError: !!loginError,
              showValue: showLoginPassword,
              onToggleShow: () => setShowLoginPassword((prev) => !prev),
              autoComplete: 'current-password',
              disabled: isLoginSubmitting,
            })}

            <div className="min-h-[14px]">
              {loginError && (
                <p
                  className="text-center text-[14px] leading-[1.1]"
                  style={{
                    color: 'rgba(219, 0, 48, 1)',
                    fontFamily: 'Roboto, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    letterSpacing: 0,
                    textAlign: 'center',
                  }}
                >
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoginSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'rgba(188, 236, 48, 1)', fontFamily: 'Roboto, sans-serif' }}
            >
              {isLoginSubmitting ? 'Входим...' : 'Войти'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              disabled={isLoginSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black hover:bg-black/5 transition-colors disabled:opacity-60"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Зарегистрироваться
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="w-[280px] flex flex-col gap-[10px]">
            <input
              id="login-title"
              type="email"
              value={emailValue}
              disabled={isRegisterSubmitting}
              onChange={(e) => {
                setEmailValue(e.target.value)
                if (registerError) setRegisterError('')
              }}
              placeholder="Эл. почта"
              className={inputClassName(registerError.includes('почта'))}
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
              autoComplete="email"
            />
            {renderPasswordInput({
              value: password,
              onChange: (nextValue) => {
                setPassword(nextValue)
                if (registerError) setRegisterError('')
              },
              placeholder: 'Пароль',
              hasError: false,
              showValue: showRegisterPassword,
              onToggleShow: () => setShowRegisterPassword((prev) => !prev),
              autoComplete: 'new-password',
              disabled: isRegisterSubmitting,
            })}
            {renderPasswordInput({
              value: repeatPassword,
              onChange: (nextValue) => {
                setRepeatPassword(nextValue)
                if (registerError) setRegisterError('')
              },
              placeholder: 'Повторите пароль',
              hasError: registerError.includes('Пароли'),
              showValue: showRegisterRepeatPassword,
              onToggleShow: () => setShowRegisterRepeatPassword((prev) => !prev),
              autoComplete: 'new-password',
              disabled: isRegisterSubmitting,
            })}

            <p
              className="text-[12px] leading-[1.2] text-black/60"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Пароль: минимум 6 символов, минимум 2 спецсимвола и минимум 1 заглавная буква.
            </p>

            <div className="min-h-[34px] pt-1">
              {registerError && (
                <p
                  className="text-center text-[18px] leading-[1.1] text-[#FF4D6D]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {registerError.includes('почта') ? (
                    <>
                      Данная почта уже используется.
                      <br />
                      Попробуйте войти.
                    </>
                  ) : (
                    registerError
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isRegisterSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'rgba(188, 236, 48, 1)', fontFamily: 'Roboto, sans-serif' }}
            >
              {isRegisterSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              disabled={isRegisterSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black hover:bg-black/5 transition-colors disabled:opacity-60"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Войти
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
