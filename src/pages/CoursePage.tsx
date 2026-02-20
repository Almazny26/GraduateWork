import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { SkillCourseCard } from '@/components/SkillCourseCard'
import { getCourseBySlug } from '@/data/courses'
import { useAuth } from '@/contexts/AuthContext'

const COMMON_DIRECTIONS = [
  'Йога для новичков',
  'Классическая йога',
  'Кундалини-йога',
  'Йогатерапия',
  'Хатха-йога',
  'Аштанга-йога',
]

const COURSE_DESCRIPTIONS: Record<
  string,
  {
    suits: string[]
    directions: string[]
    heroTitle: string
    heroBullets: string[]
  }
> = {
  yoga: {
    suits: [
      'Давно хотели попробовать\nйогу, но не решались начать',
      'Хотите укрепить\nпозвоночник, избавиться\nот болей в спине\nи суставах',
      'Ищете активность,\nполезную для тела и души',
    ],
    directions: COMMON_DIRECTIONS,
    heroTitle: 'Начните путь к новому телу',
    heroBullets: [
      'проработка всех групп мышц',
      'тренировка суставов',
      'улучшение циркуляции крови',
      'упражнения заряжают бодростью',
      'помогают противостоять стрессам',
    ],
  },
  stretching: {
    suits: [
      'Хотите развить гибкость и пластичность',
      'Нужна реабилитация после травм',
      'Ищете спокойную нагрузку без прыжков',
    ],
    directions: COMMON_DIRECTIONS,
    heroTitle: 'Гибкость и здоровье',
    heroBullets: [
      'растяжка всех групп мышц',
      'улучшение осанки',
      'снятие напряжения',
    ],
  },
  fitness: {
    suits: [
      'Хотите укрепить мышцы и выносливость',
      'Готовы к регулярным тренировкам',
      'Цель — подтянутое тело',
    ],
    directions: COMMON_DIRECTIONS,
    heroTitle: 'Сила и выносливость',
    heroBullets: [
      'проработка всех групп мышц',
      'тренировка суставов',
      'улучшение циркуляции крови',
    ],
  },
  step: {
    suits: [
      'Любите ритмичную нагрузку',
      'Хотите сжечь калории весело',
      'Есть степ-платформа или готовы импровизировать',
    ],
    directions: COMMON_DIRECTIONS,
    heroTitle: 'Ритм и энергия',
    heroBullets: ['кардионагрузка', 'координация', 'выносливость'],
  },
  bodyflex: {
    suits: [
      'Интересует дыхательная гимнастика',
      'Хотите мягкую нагрузку',
      'Нужна практика для снятия стресса',
    ],
    directions: COMMON_DIRECTIONS,
    heroTitle: 'Дыхание и лёгкость',
    heroBullets: ['дыхательные техники', 'растяжка', 'расслабление'],
  },
}

function StarIcon({ className }: { className?: string }) {
  return (
    <img
      src="/images/star.svg"
      alt=""
      width={26}
      height={26}
      className={className}
      aria-hidden
    />
  )
}

export function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, openLoginModal } = useAuth()
  const [showcaseHovered, setShowcaseHovered] = useState(false)
  const course = slug ? getCourseBySlug(slug) : undefined
  const description = slug ? COURSE_DESCRIPTIONS[slug] : undefined

  if (!course || !description) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text overflow-x-hidden">
      <Header />
      {/* Frame 2043683081 (node 60:2107): колонка, gap 60px — жёлтая карточка, «Подойдет для вас», «Направления» */}
      <div className="relative z-0 max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[60px] flex flex-col">
        {/* Верхняя карточка: название и цвет по выбранной тренировке */}
        <SkillCourseCard
          imageSrc={course.imageSkillCard}
          mobileImageSrc={course.image}
          title={course.title}
          slug={course.slug}
        />

        {/* Подойдет для вас: от заголовка до карточек 40px; от карточек до «Направления» 60px */}
        <section
          className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]"
          aria-labelledby="suits-heading"
        >
          <h2
            id="suits-heading"
            className="text-left"
            style={{
              width: '100%',
              maxWidth: 810,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            Подойдет для вас, если:
          </h2>
          <div
            className="flex flex-col sm:flex-row sm:flex-wrap items-stretch"
            style={{ gap: 17 }}
          >
            {description.suits.map((text, i) => (
              <div
                key={i}
                className="rounded-[28px] flex flex-col justify-start items-start min-w-0 flex-1 basis-full sm:basis-[280px] max-w-[343px] sm:max-w-full box-border overflow-hidden"
                style={{
                  minWidth: 0,
                  height: 'auto',
                  minHeight: 0,
                  padding: 20,
                  gap: 10,
                  background:
                    'linear-gradient(152.61deg, rgba(21.46, 23.48, 31.57, 1), rgba(30.28, 33.45, 46.14, 1))',
                }}
              >
                <div
                  className="flex flex-row justify-start items-center gap-[25px] flex-1 min-w-0 w-full box-border"
                >
                  {/* Цифра: Roboto Medium 75px, 135%, цвет #BCEC30 */}
                  <span
                    className="shrink-0 leading-[1.35]"
                    style={{
                      color: 'rgba(188, 236, 48, 1)',
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 500,
                      fontSize: '75px',
                      letterSpacing: 0,
                      textAlign: 'left',
                    }}
                  >
                    {i + 1}
                  </span>
                  {/* Текст по макету: 268×78, white, Roboto Regular 24px, 110%, 400 */}
                  <span
                    className="min-w-0 flex-1 break-words whitespace-pre-line block text-left font-normal"
                    style={{
                      color: 'rgba(255, 255, 255, 1)',
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '18px',
                      lineHeight: '110%',
                      letterSpacing: '0px',
                      textAlign: 'left',
                    }}
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Направления: от карточек до этого блока 60px; от этого блока до «Тренировки» 40px */}
        <div className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]">
          <h2
            className="text-left"
            style={{
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 500,
              fontSize: '24px',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            Направления
          </h2>
          {/* Frame 2043683031: 1160×146, flex column, gap 10, padding 30, radius 28, один цвет на всех страницах */}
          {/* Frame 2043683031: гибкий блок; на md+ — 2 строки, 158px по горизонтали, 34px между строками */}
          <div
            className="w-[343px] sm:w-full max-w-[343px] sm:max-w-[1160px] h-[336px] sm:h-auto sm:min-h-[146px] rounded-[28px] p-[30px] box-border flex flex-col justify-start items-start overflow-hidden"
            style={{
              gap: 10,
              backgroundColor: 'rgba(188, 236, 48, 1)',
            }}
          >
            <div
              className="w-full h-full sm:h-auto min-w-0 flex flex-col justify-between lg:grid lg:grid-rows-2 lg:grid-flow-col lg:gap-x-[158px] lg:gap-y-[34px] lg:content-start"
            >
              {description.directions.map((name) => (
                <div
                  key={name}
                  className="flex flex-row items-start gap-2 sm:gap-[8px] min-w-0 w-full"
                >
                  <StarIcon className="w-[26px] h-[26px] shrink-0 flex-shrink-0 mt-0.5" />
                  <span
                    className="text-[18px] sm:text-[24px] font-normal leading-[1.1] min-w-0 break-words"
                    style={{ color: 'rgba(0, 0, 0, 1)' }}
                  >
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Group 1597880544: 1160×588 — по макету node 31-1394; 102px от верхнего блока */}
      <section className="relative z-[120] max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-14 xl:px-[140px] pt-0 sm:pt-0 pb-0 sm:pb-[90px]">
        <div className="md:hidden relative mt-[156px] pb-[30px] w-full max-w-[343px] mx-auto">
          <div
            className="pointer-events-none absolute z-[70]"
            style={{
              left: '-74px',
              top: '-265px',
              width: '500px',
              height: '472px',
            }}
            aria-hidden
          >
            <img
              src="/images/green_line.svg?v=2"
              alt=""
              className="absolute object-contain"
              style={{
                left: 0,
                top: '85.92px',
                width: '492px',
                height: '386px',
              }}
            />
            <img
              src="/images/man.png"
              alt=""
              className="absolute object-contain"
              style={{
                left: '148px',
                top: '7.93px',
                width: '343px',
                height: '378px',
              }}
              onError={(e) => {
                const img = e.currentTarget
                if (img.getAttribute('data-fallback')) return
                img.setAttribute('data-fallback', '1')
                img.src = course.image
              }}
            />
            <img
              src="/images/black_line.svg?v=4"
              alt=""
              className="absolute"
              style={{ left: '212px', top: '88px', width: '56px', height: '36px', opacity: 1 }}
            />
          </div>

          <div className="relative z-[90] w-full rounded-[30px] bg-white px-6 pb-6 pt-[30px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]">
            <div className="flex flex-col gap-6">
              <h2
                className="text-left max-w-[240px]"
                style={{
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: 32,
                  lineHeight: '110%',
                  letterSpacing: '0px',
                  textAlign: 'left',
                }}
              >
                {description.heroTitle}
              </h2>
              <div
                className="flex flex-col gap-[8px]"
                style={{
                  opacity: 0.6,
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '110%',
                  letterSpacing: 0,
                }}
              >
                {description.heroBullets.map((line) => (
                  <div key={line} className="flex items-start gap-3">
                    <span
                      className="rounded-full shrink-0 w-[4px] h-[4px] mt-[8px]"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
                      aria-hidden
                    />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={openLoginModal}
                className="w-full h-[52px] rounded-[46px] hover:opacity-90 transition-opacity flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(188, 236, 48, 1)',
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '110%',
                  letterSpacing: '0px',
                }}
              >
                <span
                  style={{
                    width: '112px',
                    height: '18px',
                    textAlign: 'left',
                    display: 'inline-block',
                  }}
                >
                  {user ? 'Добавить курс' : 'Войдите, чтобы добавить курс'}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div
          className="hidden md:block"
        >
          <div
          className="relative w-full max-w-[1160px] overflow-hidden"
          style={{ minHeight: 588 }}
          onMouseEnter={() => setShowcaseHovered(true)}
          onMouseLeave={() => setShowcaseHovered(false)}
        >
          {/* Rectangle 111003296 / 111003295: 1160×486, radius 30, shadow, white */}
          <div
            className="absolute left-0 w-full rounded-[30px] overflow-hidden"
            style={{
              top: 102,
              width: 1160,
              height: 486,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
            }}
          />

          {/* Frame 2043683032: 437×406, (40,142), flex col gap 28 */}
          <div
            className="absolute flex flex-col justify-start items-start pointer-events-auto z-10"
            style={{
              left: 40,
              top: 142,
              width: 437,
              height: 406,
              gap: 28,
            }}
          >
            {/* Заголовок: 398×120, Roboto Medium 60px, 500, line-height 100% */}
            <h2
              className="text-left"
              style={{
                width: 398,
                minHeight: 120,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: 60,
                lineHeight: '100%',
                letterSpacing: 0,
              }}
            >
              {description.heroTitle}
            </h2>
            {/* Список: 437×178, flex row, Roboto Regular 24px, 110%, по макету */}
            <div
              className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2"
              style={{
                width: 437,
                height: 178,
                marginLeft: 5,
                opacity: 0.6,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 24,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
              }}
            >
              {description.heroBullets.map((line) => (
                <div key={line} className="flex flex-row items-center shrink-0" style={{ gap: 20 }}>
                  <span
                    className="rounded-full shrink-0 w-[6px] h-[6px]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
                    aria-hidden
                  />
                  {line}
                </div>
              ))}
            </div>
            {/* Frame 2043683033: кнопка 437×52, padding 16px 26px, radius 46px */}
            <button
              type="button"
              onClick={openLoginModal}
              className="flex flex-row justify-center items-center shrink-0 hover:opacity-90 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0px_8px_22px_rgba(188,236,48,0.45)]"
              style={{
                width: 437,
                height: 52,
                gap: 10,
                padding: '16px 26px',
                borderRadius: 46,
                backgroundColor: 'rgba(188, 236, 48, 1)',
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 18,
              }}
            >
              {user ? 'Добавить курс' : 'Войдите, чтобы добавить курс'}
            </button>
          </div>

          {/* Конструкция (парень, силует, линии): обёртка с лёгким увеличением */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: 'translateX(40px) scale(1.06)',
              transformOrigin: '800px 317px',
            }}
          >
            {/* Обводка (vector_men): не видна в макете, оставлена для анимации */}
            <div
              className="absolute pointer-events-none z-0 opacity-0"
              style={{
                left: 635.19,
                top: 25.4,
                width: 487,
                height: 542.49,
                transform: 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                backgroundColor: 'rgb(217, 217, 217)',
                borderRadius: 2,
              }}
              aria-hidden
              data-animation-layer="outline"
            />

            {/* Синий силует: прямо за парнем (по центру), поверх зелёной линии */}
            <div
              className="absolute pointer-events-none z-[1]"
              style={{
                left: 526,
                top: 52,
                width: 565.51,
                height: 567.28,
                transform: showcaseHovered
                  ? 'scale(1.08) rotate(-2.99deg)'
                  : 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                transition: 'transform 560ms cubic-bezier(0.16, 1, 0.3, 1), filter 560ms ease-out',
                filter: showcaseHovered
                  ? 'drop-shadow(0 16px 30px rgba(0, 0, 0, 0.22))'
                  : 'drop-shadow(0 5px 12px rgba(0, 0, 0, 0.13))',
              }}
              data-animation-layer="silhouette"
            >
              <img
                src="/images/men_1.png"
                alt=""
                className="w-full h-full object-contain object-center"
              />
            </div>

            {/* Векторы: чёрная + зелёная линия на заднем плане (за силуетом и парнем) */}
            <div
              className="absolute pointer-events-none z-0 overflow-visible"
              style={{
                left: 20,
                top: 102,
                width: 1160,
                height: 486,
                borderRadius: 46,
              }}
              aria-hidden
              data-animation-layer="vectors"
            >
              <img
                src="/images/vectors_group.svg"
                alt=""
                className="w-full h-full object-cover object-left-top"
                style={{ objectPosition: '-55px -22px' }}
              />
            </div>

            {/* Парень: на переднем плане */}
            <div
              className="absolute pointer-events-none z-[2]"
              style={{
                left: 553,
                top: 48.9,
                width: 519.47,
                height: 539.54,
                transform: showcaseHovered
                  ? 'scale(1.08) rotate(-2.99deg)'
                  : 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                transition: 'transform 560ms cubic-bezier(0.16, 1, 0.3, 1), filter 560ms ease-out',
                filter: showcaseHovered
                  ? 'drop-shadow(0 28px 46px rgba(0, 0, 0, 0.3))'
                  : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))',
              }}
            >
              <img
                src="/images/man.png"
                alt=""
                className="w-full h-full object-contain object-center"
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const img = e.currentTarget
                  if (img.getAttribute('data-fallback')) return
                  img.setAttribute('data-fallback', '1')
                  img.src = course.image
                }}
              />
            </div>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
