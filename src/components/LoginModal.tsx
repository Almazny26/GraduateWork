import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

import photoMiniImg from '@/assets/photo_mini.png'

type Props = { open: boolean; onClose: () => void }
type AuthMode = 'login' | 'register'

const DEFAULT_USER = {
  name: 'Сергей',
  login: 'sergey.petrov96',
  email: 'sergey.petrov96@mail.ru',
  password: '12345678',
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const loginName = loginValue.trim()
    const pass = password.trim()
    const loginMatch =
      loginName === DEFAULT_USER.login || loginName === DEFAULT_USER.email || loginName === ''

    if (!loginMatch || pass !== DEFAULT_USER.password) {
      setLoginError('Пароль введен неверно, попробуйте еще раз.')
      return
    }

    login({
      name: DEFAULT_USER.name,
      login: DEFAULT_USER.login,
      email: DEFAULT_USER.email,
      avatarUrl: photoMiniImg,
    })
    clearFormState()
    onClose()
    navigate('/profile')
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    const email = emailValue.trim().toLowerCase()
    const pass = password.trim()
    const passRepeat = repeatPassword.trim()

    if (email === DEFAULT_USER.email) {
      setRegisterError('Данная почта уже используется. Попробуйте войти.')
      return
    }
    if (!email || !pass || !passRepeat) {
      setRegisterError('Заполните все поля.')
      return
    }
    if (pass !== passRepeat) {
      setRegisterError('Пароли не совпадают.')
      return
    }

    const loginFromEmail = email.split('@')[0] || 'new.user'
    login({
      name: 'Пользователь',
      login: loginFromEmail,
      email,
      avatarUrl: photoMiniImg,
    })
    clearFormState()
    onClose()
    navigate('/profile')
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
  }: {
    value: string
    onChange: (value: string) => void
    placeholder: string
    hasError: boolean
    showValue: boolean
    onToggleShow: () => void
    autoComplete: string
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
        className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-[#7A7A7A] hover:text-black transition-colors"
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className={`relative w-full rounded-[30px] bg-white p-[40px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
        }`}
        style={{ maxWidth: 366 }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/images/logo.svg"
          alt="SkyFitnessPro"
          width={220}
          height={35}
          className="mx-auto mb-[48px] h-[35px] w-[220px] object-contain"
        />

        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-[10px]">
            <input
              id="login-title"
              type="text"
              value={loginValue}
              onChange={(e) => {
                setLoginValue(e.target.value)
                if (loginError) setLoginError('')
              }}
              placeholder="Логин"
              className={inputClassName(false)}
              style={{ fontFamily: 'Roboto, sans-serif', fontSize: 18 }}
              autoComplete="username"
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
            })}

            <div className="min-h-[34px] pt-1">
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
                  Пароль введен неверно,
                  <br />
                  попробуйте еще раз.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'rgba(188, 236, 48, 1)', fontFamily: 'Roboto, sans-serif' }}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black hover:bg-black/5 transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Зарегистрироваться
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-[10px]">
            <input
              id="login-title"
              type="email"
              value={emailValue}
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
            })}

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
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'rgba(188, 236, 48, 1)', fontFamily: 'Roboto, sans-serif' }}
            >
              Зарегистрироваться
            </button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full h-[52px] flex justify-center items-center rounded-[46px] border border-black text-[18px] leading-[1.1] text-black hover:bg-black/5 transition-colors"
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
