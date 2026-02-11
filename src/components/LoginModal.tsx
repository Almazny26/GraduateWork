import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

import photoMiniImg from '@/assets/photo_mini.png'

type Props = { open: boolean; onClose: () => void }

export function LoginModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const loginName = loginValue.trim() || 'sergey.petrov96'
    login({
      name: 'Сергей',
      login: loginName,
      email: 'sergey.petrov96@mail.ru',
      avatarUrl: photoMiniImg,
    })
    setLoginValue('')
    setPassword('')
    onClose()
    navigate('/profile')
  }

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
    >
      <div
        className="relative w-full max-w-[440px] rounded-[30px] bg-white p-10 shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="login-title"
          className="text-left font-semibold text-[40px] leading-[1.1] text-black mb-10"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          Вход
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <span
              className="text-[18px] leading-[1.1] text-black"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Логин
            </span>
            <input
              type="text"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              placeholder="sergey.petrov96"
              className="w-full rounded-[12px] border border-[#D9D9D9] px-4 py-3 text-[18px] leading-[1.1] text-black placeholder:text-black/40 outline-none focus:border-[#BCEC30]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
              autoComplete="username"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span
              className="text-[18px] leading-[1.1] text-black"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-[12px] border border-[#D9D9D9] px-4 py-3 text-[18px] leading-[1.1] text-black placeholder:text-black/40 outline-none focus:border-[#BCEC30]"
              style={{ fontFamily: 'Roboto, sans-serif' }}
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="w-full flex justify-center items-center rounded-[46px] py-4 text-[18px] leading-[1.1] text-black font-normal hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: 'rgba(188, 236, 48, 1)',
              fontFamily: 'Roboto, sans-serif',
            }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  )
}
