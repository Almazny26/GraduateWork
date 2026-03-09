import { useState } from 'react'
import type { ProfileCourse } from '@/pages/ProfilePage/types'

export type ProfileCourseCardProps = {
  course: ProfileCourse
  progress: number
  progressLoading?: boolean
  onRemove?: () => void
  removeDisabled?: boolean
  isRemoving?: boolean
  onStart?: () => Promise<void> | void
  startDisabled?: boolean
  startLoading?: boolean
}

export function ProfileCourseCard({
  course,
  progress,
  progressLoading = false,
  onRemove,
  removeDisabled = false,
  isRemoving = false,
  onStart,
  startDisabled = false,
  startLoading = false,
}: ProfileCourseCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const progressLabel =
    progress === 0
      ? 'Начать тренировки'
      : progress >= 100
        ? 'Начать заново'
        : 'Продолжить'

  return (
    <div
      className={`relative w-[343px] sm:w-[360px] min-h-[649px] shrink-0 overflow-visible transition-opacity duration-300 ${
        isRemoving ? 'opacity-80' : 'opacity-100 group card-hover-group'
      }`}
      style={{ cursor: "url('/images/cursor.svg') 0 0, auto" }}
    >
      <article
        className="relative flex flex-col items-center overflow-visible rounded-[30px] bg-white pb-[15px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] w-full min-h-[649px]"
        style={{ gap: 24 }}
      >
        <div className="relative w-full h-[325px] overflow-hidden rounded-t-[30px]">
          <img
            src={course.image}
            alt=""
            className="w-full h-full object-cover object-top"
          />
          <button
            type="button"
            disabled={removeDisabled}
            className="absolute rounded-full flex items-center justify-center sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-110 shrink-0"
            style={{
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              background: 'transparent',
              cursor: "url('/images/cursor.svg') 0 0, auto",
              opacity: removeDisabled ? 0.6 : 1,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setTooltipVisible(false)
              onRemove?.()
            }}
            onMouseEnter={(e) => {
              setTooltipPos({ x: e.clientX, y: e.clientY })
              setTooltipVisible(true)
            }}
            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label="Удалить курс"
          >
            <img
              src="/images/minus_svg.svg"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </button>
        </div>
        <div className="flex flex-col gap-[20px] sm:gap-[40px] px-6 w-full items-start">
          <div
            className="flex flex-col w-full max-w-[300px]"
            style={{ gap: 20 }}
          >
            <h3
              className="w-full sm:transition-transform sm:duration-300 sm:ease-out origin-left sm:group-hover:scale-[1.03]"
              style={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 500,
                fontSize: '32px',
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
                color: 'rgba(0, 0, 0, 1)',
              }}
            >
              <span className="card-title-glow">{course.title}</span>
            </h3>
            <div className="flex flex-col gap-[6px]">
              <div className="flex flex-wrap gap-[6px]">
                <span
                  className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <img
                    src="/images/calendar-icon.svg"
                    alt=""
                    className="w-[18px] h-[18px]"
                  />
                  25 дней
                </span>
                <span
                  className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <img
                    src="/images/time-icon.svg"
                    alt=""
                    className="w-[18px] h-[18px]"
                  />
                  20-50 мин/день
                </span>
              </div>
              <div className="flex flex-wrap gap-[6px]">
                <span
                  className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  <img
                    src="/images/signal-icon.svg"
                    alt=""
                    className="w-[18px] h-[18px]"
                  />
                  Сложность
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[10px] w-full max-w-[300px]">
            <p
              className="text-[18px] leading-[1.1] text-black text-left flex items-center gap-2"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Прогресс{' '}
              {progressLoading ? (
                <span
                  className="relative inline-block w-[18px] h-[18px] shrink-0"
                  aria-hidden
                >
                  <span className="absolute inset-0 rounded-full border-2 border-[#D9D9D9] border-t-[#00C1FF] border-r-[#00C1FF] animate-spin" />
                </span>
              ) : (
                `${progress}%`
              )}
            </p>
            <div className="h-[6px] w-full max-w-[300px] rounded-[50px] bg-[#D9D9D9] overflow-hidden">
              {progressLoading ? (
                <div className="profile-progress-loading-bar h-full rounded-[50px]" />
              ) : (
                <div
                  className="h-full rounded-[50px] transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: 'rgba(0, 193, 255, 1)',
                  }}
                />
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStart?.()}
            disabled={startDisabled}
            className="w-full max-w-[300px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black font-normal sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-[1.03]"
            style={{
              backgroundColor: '#BCEC30',
              fontFamily: 'Roboto, sans-serif',
              padding: '16px 26px',
              opacity: startDisabled ? 0.65 : 1,
            }}
          >
            {startLoading ? 'Загружаем...' : progressLabel}
          </button>
        </div>
      </article>
      {isRemoving && (
        <div className="absolute inset-0 z-[40] rounded-[30px] bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="relative w-9 h-9" aria-hidden>
            <span className="absolute inset-0 rounded-full border-[3px] border-white/40" />
            <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white border-r-white animate-spin" />
          </div>
        </div>
      )}
      {tooltipVisible && !isRemoving && (
        <div
          className="fixed z-[100] flex flex-row items-center justify-center box-border pointer-events-none"
          style={{
            left: tooltipPos.x + 17,
            top: tooltipPos.y + 15,
            width: 100,
            height: 27,
            padding: 6,
            gap: 10,
            border: '0.5px solid rgba(0, 0, 0, 1)',
            borderRadius: 5,
            background: 'rgba(255, 255, 255, 1)',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 14,
            lineHeight: '110%',
            letterSpacing: 0,
            textAlign: 'left',
            color: 'rgba(32, 32, 32, 1)',
            whiteSpace: 'nowrap',
          }}
        >
          Удалить курс
        </div>
      )}
    </div>
  )
}
