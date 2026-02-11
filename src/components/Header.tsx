import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout, openLoginModal } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleProfileClick = () => {
    setDropdownOpen(false)
    navigate('/profile')
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 md:px-14 lg:px-[140px] pt-6 sm:pt-[50px] max-w-[1440px] mx-auto w-full min-w-0">
      <div className="flex flex-col gap-2 sm:gap-[15px] min-w-0">
        <Link
          to="/"
          className="block w-[180px] sm:w-[220px] h-[29px] sm:h-[35px]"
        >
          <img
            src="/images/logo.svg"
            alt="SkyFitnessPro"
            className="w-full h-full object-contain object-left"
            width={220}
            height={35}
          />
        </Link>
        <p className="text-base sm:text-lg text-text opacity-50 leading-tight">
          Онлайн-тренировки для занятий дома
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0 relative" ref={dropdownRef}>
        {user ? (
          <>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex flex-row items-center gap-4 rounded-[46px] hover:opacity-90 transition-opacity py-1 pr-2 pl-1"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <img
                src="/images/photo_mini.png"
                alt=""
                className="w-[50px] h-[50px] shrink-0"
                width={50}
                height={50}
              />
              <span className="text-[24px] leading-[1.1] text-black font-normal text-right">
                {user.name}
              </span>
              <img
                src="/images/down_svg.svg"
                alt=""
                className="shrink-0"
                style={{ width: 12, height: 12, marginLeft: -4 }}
              />
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 z-50 flex flex-col items-center rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] overflow-visible"
                style={{
                  width: 320,
                  minHeight: 258,
                  gap: 34,
                  padding: 30,
                }}
              >
                <div className="flex flex-col items-center w-full min-w-0" style={{ gap: 10 }}>
                  <span
                    className="text-[18px] leading-[1.1] text-black"
                    style={{ fontFamily: 'StratosSkyeng, Roboto, sans-serif' }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[18px] leading-[1.1] text-[#999999]"
                    style={{ fontFamily: 'StratosSkyeng, Roboto, sans-serif' }}
                  >
                    {user.email || user.login}
                  </span>
                </div>
                <div className="flex flex-col items-center" style={{ gap: 10 }}>
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black"
                    style={{
                      width: 206,
                      height: 52,
                      padding: '16px 26px',
                      backgroundColor: 'rgba(188, 236, 48, 1)',
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    Мой профиль
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex justify-center items-center rounded-[46px] border text-[18px] leading-[1.1] text-black hover:bg-black/5 transition-colors"
                    style={{
                      width: 206,
                      height: 52,
                      padding: '16px 26px',
                      border: '1px solid rgba(0, 0, 0, 1)',
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    Выйти
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={openLoginModal}
            className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity shrink-0"
            style={{
              width: 103,
              height: 52,
              gap: 8,
              padding: '16px 26px',
              background: 'rgba(188, 236, 48, 1)',
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '18px',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'center',
            }}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  )
}
