import './LoginModal.css'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'
import type { AuthMode, LoginModalProps } from './types'
import photoMiniImg from '@/assets/photo_mini.png'

// тут тоже достаю email/selectedCourses из ответа API (как в AuthContext)
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
    const fromSelectedCourses = normalizeSelectedCourseIds(
      record.selectedCourses
    )
    if (fromSelectedCourses.length > 0) return fromSelectedCourses
  }
  for (const record of records) {
    const fromCourses = normalizeSelectedCourseIds(record.courses)
    if (fromCourses.length > 0) return fromCourses
  }
  return []
}

// модалка входа/регистрации, после успеха вызываем login() из контекста
export function LoginModal({ open, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [shouldRender, setShouldRender] = useState(open)
  const [isVisible, setIsVisible] = useState(false) // для анимации появления
  const [mode, setMode] = useState<AuthMode>('login')
  const [loginValue, setLoginValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [canShowRegisterError, setCanShowRegisterError] = useState(false)
  const [registerSubmitAttempted, setRegisterSubmitAttempted] = useState(false)
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false)
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false)
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const closeTimerRef = useRef<number | null>(null)

  const clearFormState = () => {
    setLoginValue('')
    setEmailValue('')
    setPassword('')
    setRepeatPassword('')
    setLoginError('')
    setRegisterError('')
    setCanShowRegisterError(false)
    setRegisterSubmitAttempted(false)
    setIsLoginSubmitting(false)
    setIsRegisterSubmitting(false)
    setShowLoginPassword(false)
    setShowRegisterPassword(false)
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setLoginError('')
    setRegisterError('')
    setCanShowRegisterError(false)
    setShowLoginPassword(false)
    setShowRegisterPassword(false)
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
      setCanShowRegisterError(false)
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
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
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
        token
      )
      clearFormState()
      onClose()
      navigate('/profile')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Ошибка авторизации'
      const isWrongPassword =
        message.toLowerCase().includes('неверный') &&
        message.toLowerCase().includes('пароль')
      setLoginError(
        isWrongPassword
          ? 'Пароль введен неверно,\nпопробуйте еще раз.'
          : message
      )
    } finally {
      setIsLoginSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isRegisterSubmitting) return
    setCanShowRegisterError(true)
    setRegisterSubmitAttempted(true)
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
        token
      )
      clearFormState()
      onClose()
      navigate('/profile')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Ошибка регистрации'
      const isExistingEmail =
        msg.toLowerCase().includes('почта') ||
        msg.toLowerCase().includes('уже существует') ||
        msg.toLowerCase().includes('уже используется')
      setRegisterError(
        isExistingEmail
          ? 'Данная почта уже используется. Попробуйте войти.'
          : msg
      )
    } finally {
      setIsRegisterSubmitting(false)
    }
  }

  const inputClassName = (hasError: boolean) =>
    `w-full h-[52px] rounded-[8px] border bg-white px-4 text-[18px] leading-[1.1] text-black placeholder:text-black/25 outline-none ${
      hasError ? 'border-[#FF4D6D]' : 'border-[#D0D0D0]'
    }`

  if (!shouldRender) return null

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className={`relative w-[343px] sm:w-[360px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center transition-all duration-300 ease-out p-10 gap-12 ${
          mode === 'register' ? 'min-h-[465px] sm:min-h-[487px]' : 'h-[425px]'
        } ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
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
          <form
            onSubmit={handleLoginSubmit}
            className="w-[280px] flex flex-col gap-[10px]"
          >
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
            <div className="relative">
              <input
                type={showLoginPassword ? 'text' : 'password'}
                value={password}
                disabled={isLoginSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (loginError) setLoginError('')
                }}
                placeholder="Пароль"
                className={`${inputClassName(!!loginError)} pr-12`}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword((v) => !v)}
                className="no-scale-hover absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded border-0 bg-transparent text-black/50 sm:hover:text-black focus:outline-none"
                aria-label={showLoginPassword ? 'Скрыть пароль' : 'Показать пароль'}
                tabIndex={-1}
              >
                {showLoginPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>

            <div className="min-h-[14px]">
              {loginError && (
                <p
                  className="text-center text-[14px] leading-[1.1] whitespace-pre-line"
                  style={{
                    color: 'rgba(219, 0, 48, 1)',
                    fontFamily: 'Roboto, sans-serif',
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
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black sm:hover:opacity-90 sm:hover:scale-[1.03] transition-all duration-300 ease-out disabled:opacity-60"
              style={{
                backgroundColor: 'rgba(188, 236, 48, 1)',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {isLoginSubmitting ? 'Входим...' : 'Войти'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                switchMode('register')
              }}
              disabled={isLoginSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black sm:hover:bg-black/5 sm:hover:scale-[1.03] transition-all duration-300 ease-out disabled:opacity-60"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Зарегистрироваться
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit}
            className="w-[280px] flex flex-col gap-[10px]"
          >
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
              className={inputClassName(
                !!(
                  canShowRegisterError &&
                  registerSubmitAttempted &&
                  registerError &&
                  (registerError.includes('почта') ||
                    registerError.includes('уже используется'))
                )
              )}
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
              autoComplete="email"
            />
            <div className="relative">
              <input
                type={showRegisterPassword ? 'text' : 'password'}
                value={password}
                disabled={isRegisterSubmitting}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (registerError) setRegisterError('')
                }}
                placeholder="Пароль"
                className={`${inputClassName(false)} pr-12`}
                style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowRegisterPassword((v) => !v)}
                className="no-scale-hover absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded border-0 bg-transparent text-black/50 sm:hover:text-black focus:outline-none"
                aria-label={showRegisterPassword ? 'Скрыть пароль' : 'Показать пароль'}
                tabIndex={-1}
              >
                {showRegisterPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            <input
              type={showRegisterPassword ? 'text' : 'password'}
              value={repeatPassword}
              disabled={isRegisterSubmitting}
              onChange={(e) => {
                setRepeatPassword(e.target.value)
                if (registerError) setRegisterError('')
              }}
              placeholder="Повторите пароль"
              className={inputClassName(registerError.includes('Пароли'))}
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
              autoComplete="new-password"
            />

            <div
              className={
                canShowRegisterError && registerSubmitAttempted && registerError
                  ? 'min-h-[34px]'
                  : 'min-h-0'
              }
            >
              {canShowRegisterError &&
                registerSubmitAttempted &&
                registerError && (
                  <p
                    className="text-center text-[14px] leading-[1.1] text-[#DB0030]"
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 400,
                      letterSpacing: 0,
                      textAlign: 'center',
                    }}
                  >
                    {registerError}
                  </p>
                )}
            </div>

            <button
              type="submit"
              disabled={isRegisterSubmitting}
              className={`w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black sm:hover:opacity-90 sm:hover:scale-[1.03] transition-all duration-300 ease-out disabled:opacity-60 ${
                canShowRegisterError && registerSubmitAttempted && registerError
                  ? 'mt-[34px]'
                  : 'mt-[24px]'
              }`}
              style={{
                backgroundColor: 'rgba(188, 236, 48, 1)',
                fontFamily: 'Roboto, sans-serif',
              }}
            >
              {isRegisterSubmitting ? 'Регистрируем...' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                switchMode('login')
              }}
              disabled={isRegisterSubmitting}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black sm:hover:bg-black/5 sm:hover:scale-[1.03] transition-all duration-300 ease-out disabled:opacity-60"
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
