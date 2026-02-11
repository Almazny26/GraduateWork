import { useState } from 'react'
import { Link } from 'react-router-dom'

type CourseCardProps = {
  title: string
  imageSrc: string
  slug: string
}

/**
 * Карточка курса по макету Figma (node 15-896, prof card 19:2400, Frame 17:2296).
 * Шрифты: заголовок 32px medium, чипы 16px normal; отступы: gap 24px, блок текста gap 20px, чипы gap 6px; тень и скругление по макету.
 * Гибкая: ширина подстраивается под сетку, не накладывается при уменьшении экрана.
 */
export function CourseCard({ title, imageSrc, slug }: CourseCardProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  return (
    <Link to={`/course/${slug}`} className="block w-full min-w-0 overflow-visible" style={{ cursor: "url('/images/cursor.svg') 0 0, auto" }}>
      <article
        className="relative flex flex-col items-stretch w-full max-w-[360px] mx-auto gap-6 rounded-[30px] overflow-hidden bg-white pb-[15px]"
        style={{
          boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
        }}
      >
        {/* Превью: соотношение сторон по макету 360×325 */}
        <div className="w-full overflow-hidden relative rounded-t-[30px] aspect-[360/325] bg-[#F7F7F7]">
          <img
            src={imageSrc}
            alt=""
            className="w-full h-full object-cover object-top"
            width={360}
            height={325}
          />
          {/* Кнопка добавления — SVG из Figma node 33:2051 */}
          <span
            className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center shrink-0"
            style={{ cursor: "url('/images/cursor.svg') 0 0, auto", pointerEvents: 'auto' }}
            onMouseEnter={(e) => {
              setTooltipPos({ x: e.clientX, y: e.clientY })
              setTooltipVisible(true)
            }}
            onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setTooltipVisible(false)}
            aria-label="Добавить курс"
          >
            <img
              src="/images/add-workout-button.svg"
              alt=""
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            {tooltipVisible && (
              <div
                className="fixed z-50 flex flex-row items-center justify-center box-border"
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
                Добавить курс
              </div>
            )}
          </span>
        </div>
        {/* Текстовый блок: по макету gap 20px, заголовок 32px, чипы gap 6px */}
        <div className="flex flex-col gap-5 w-full px-6 pb-1 rounded-b-[30px] bg-white">
          <h2 className="text-[32px] font-medium leading-[1.1] text-[#000000]">
            {title}
          </h2>
          {/* Чипы: Frame 2043683021 — flex row, gap 6, padding 10, radius 50px, bg #F7F7F7; текст Roboto 16px 400, 110%, #202020 */}
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
    </Link>
  )
}

/** Чип по макету Frame 2043683021: 163×38, flex row, gap 6, padding 10, radius 50px, #F7F7F7; текст 16px Roboto 400, 110%, #202020. */
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
