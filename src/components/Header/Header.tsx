import './Header.css'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user, logout, openLoginModal } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownAnimated, setDropdownAnimated] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const showTagline =
    location.pathname === '/' || /^\/course\/[^/]+\/?$/.test(location.pathname)

  const closeDropdown = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    if (dropdownAnimated) {
      setDropdownAnimated(false)
      closeTimeoutRef.current = window.setTimeout(() => {
        setDropdownOpen(false)
        closeTimeoutRef.current = null
      }, 300)
    } else {
      setDropdownOpen(false)
    }
  }, [dropdownAnimated])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [closeDropdown])

  useEffect(() => {
    if (!dropdownOpen) {
      setDropdownAnimated(false)
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      return
    }
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    const raf = requestAnimationFrame(() => setDropdownAnimated(true))
    return () => cancelAnimationFrame(raf)
  }, [dropdownOpen])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current)
    }
  }, [])

  const handleProfileClick = () => {
    closeDropdown()
    navigate('/profile')
  }

  const handleLogout = () => {
    closeDropdown()
    logout()
    navigate('/')
  }

  return (
    <header className="flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-between gap-[40px] sm:gap-4 px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[50px] max-w-[1440px] mx-auto w-full min-w-0">
      <div className="flex flex-col gap-2 sm:gap-[15px] min-w-0">
        <Link to="/" className="block w-[220px] h-[35px]">
          <img
            src="/images/logo.svg"
            alt="SkyFitnessPro"
            className="w-full h-full object-contain object-left"
            width={220}
            height={35}
          />
        </Link>
        {showTagline && (
          <p className="hidden sm:block text-base sm:text-lg text-text opacity-50 leading-tight">
            Онлайн-тренировки для занятий дома
          </p>
        )}
      </div>
      <div
        className="ml-auto sm:ml-0 flex items-center gap-3 shrink-0 relative"
        ref={dropdownRef}
      >
        {user ? (
          <>
            <button
              type="button"
              onClick={() =>
                dropdownOpen ? closeDropdown() : setDropdownOpen(true)
              }
              className="flex flex-row items-center gap-2 sm:gap-4 rounded-[46px] sm:hover:opacity-90 transition-opacity py-1 pr-2 pl-1"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              <img
                src="/images/photo_mini.png"
                alt=""
                className="w-9 h-9 sm:w-[50px] sm:h-[50px] shrink-0"
                width={50}
                height={50}
              />
              <span className="hidden sm:block text-[24px] leading-[1.1] text-black font-normal text-right">
                {user.name}
              </span>
              <img
                src="/images/down_svg.svg"
                alt=""
                className="w-[14px] h-[10px] sm:w-3 sm:h-3 shrink-0 sm:ml-[-4px]"
              />
            </button>
            {dropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-2 z-50 flex flex-col items-center rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] overflow-visible transition-all duration-300 ease-out origin-top pointer-events-auto ${
                  dropdownAnimated
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-3 scale-[0.98]'
                }`}
                style={{
                  width: 320,
                  minHeight: 258,
                  gap: 34,
                  padding: 30,
                }}
              >
                <div
                  className="flex flex-col items-center w-full min-w-0"
                  style={{ gap: 10 }}
                >
                  <span
                    className="text-[18px] leading-[1.1] text-black"
                    style={{
                      fontFamily:
                        '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[18px] leading-[1.1] text-[#999999]"
                    style={{
                      fontFamily:
                        '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
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
                    className="flex justify-center items-center rounded-[46px] border text-[18px] leading-[1.1] text-black sm:hover:bg-black/5 transition-colors"
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
            className="flex flex-row justify-center items-center gap-2 rounded-[46px] sm:hover:opacity-90 sm:hover:scale-[1.03] transition-opacity duration-300 ease-out shrink-0 w-[83px] sm:w-[103px] h-[36px] sm:h-[52px] px-4 sm:px-[26px] py-2 sm:py-4"
            style={{
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
