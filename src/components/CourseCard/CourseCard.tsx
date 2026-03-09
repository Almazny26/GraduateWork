import './CourseCard.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CourseCardProps } from './types'

export function CourseCard({
  title,
  imageSrc,
  slug,
  onAddCourse,
  addDisabled = false,
  isAdded = false,
}: CourseCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  return (
    <Link
      to={`/course/${slug}`}
      className="block w-full min-w-0 overflow-visible group card-hover-group"
      style={{ cursor: "url('/images/cursor.svg') 0 0, auto" }}
    >
      <article
        className="relative flex flex-col items-stretch w-full h-[472px] sm:h-auto max-w-[343px] sm:max-w-[360px] mx-0 sm:mx-auto gap-4 sm:gap-6 rounded-[30px] overflow-hidden bg-white pb-[15px]"
        style={{
          boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
        }}
      >
        <div className="w-full overflow-hidden relative rounded-t-[30px] aspect-[343/325] sm:aspect-[360/325] bg-white">
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-contain sm:object-cover object-top bg-white"
            width={360}
            height={325}
          />
          <button
            type="button"
            disabled={addDisabled}
            className="card-add-btn no-scale-hover absolute top-5 right-5 z-30 w-8 h-8 flex items-center justify-center shrink-0 p-0 border-0 bg-transparent pointer-events-auto sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-110"
            style={{ cursor: "url('/images/cursor.svg') 0 0, auto" }}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (!addDisabled) {
                void onAddCourse?.()
              }
            }}
            onMouseEnter={(e) => {
              setTooltipPos({ x: e.clientX, y: e.clientY })
              setTooltipVisible(true)
            }}
            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label={isAdded ? 'Курс добавлен' : addDisabled ? 'Добавляем...' : 'Добавить курс'}
          >
            <span className="card-add-btn-icon-wrap">
              {addDisabled ? (
                <span className="card-add-btn-spinner" aria-hidden />
              ) : (
                <img
                  src={
                    isAdded
                      ? '/images/add-workout-button-checked.svg'
                      : '/images/add-workout-button.svg'
                  }
                  alt=""
                  width={32}
                  height={32}
                  className="card-add-btn-icon w-8 h-8 object-contain pointer-events-none"
                />
              )}
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-5 w-full px-[21.5px] pb-[15px] sm:pb-1 rounded-b-[30px] bg-white">
          <h2 className="text-[24px] sm:text-[32px] font-medium leading-[1.1] text-[#000000] sm:transition-transform sm:duration-300 sm:ease-out origin-left sm:group-hover:scale-[1.03]">
            <span className="card-title-glow">{title}</span>
          </h2>
          <div className="flex flex-col gap-[6px]">
            <div className="flex flex-row flex-wrap items-center gap-[6px]">
              <Chip icon="/images/calendar-icon.svg" label="25 дней" />
              <Chip icon="/images/time-icon.svg" label="20-50 мин/день" />
            </div>
            <div className="flex flex-row flex-wrap items-center gap-[6px]">
              <Chip icon="/images/signal-icon.svg" label="Сложность" />
            </div>
          </div>
        </div>
      </article>
      {tooltipVisible && (
        <div
          className="card-add-tooltip fixed z-50 flex flex-row items-center justify-center box-border pointer-events-none"
          style={{
            left: tooltipPos.x + 17,
            top: tooltipPos.y + 15,
            minWidth: 110,
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
          {isAdded ? 'Курс добавлен' : 'Добавить курс'}
        </div>
      )}
    </Link>
  )
}

function Chip({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      className="inline-flex flex-row justify-start items-center gap-[6px] rounded-[50px] shrink-0"
      style={{
        padding: 10,
        minHeight: 38,
        background: 'rgba(247, 247, 247, 1)',
      }}
    >
      <img
        src={icon}
        alt=""
        className="w-[18px] h-[18px] shrink-0"
        aria-hidden
      />
      <span
        className="text-left"
        style={{
          color: 'rgba(32, 32, 32, 1)',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          lineHeight: '110%',
          letterSpacing: 0,
        }}
      >
        {label}
      </span>
    </span>
  )
}
