import { useParams, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { SkillCourseCard } from '@/components/SkillCourseCard'
import { getCourseBySlug, COURSE_COLORS } from '@/data/courses'

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
      'Давно хотели попробовать йогу, но не решались начать',
      'Хотите укрепить позвоночник, избавиться от болей в спине и суставах',
      'Ищете активность, полезную для тела и души',
    ],
    directions: [
      'Йога для новичков',
      'Классическая йога',
      'Кундалини-йога',
      'Йогатерапия',
      'Хатха-йога',
      'Аштанга-йога',
    ],
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
    directions: [
      'Базовый стретчинг',
      'Глубокий стретчинг',
      'Стретчинг для спины',
      'Динамический стретчинг',
    ],
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
    directions: [
      'Силовые тренировки',
      'Функциональный тренинг',
      'Круговая тренировка',
    ],
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
    directions: ['Базовый степ', 'Степ-аэробика', 'Силовой степ'],
    heroTitle: 'Ритм и энергия',
    heroBullets: ['кардионагрузка', 'координация', 'выносливость'],
  },
  bodyflex: {
    suits: [
      'Интересует дыхательная гимнастика',
      'Хотите мягкую нагрузку',
      'Нужна практика для снятия стресса',
    ],
    directions: ['Бодифлекс для начинающих', 'Классический бодифлекс'],
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
  const course = slug ? getCourseBySlug(slug) : undefined
  const description = slug ? COURSE_DESCRIPTIONS[slug] : undefined

  if (!course || !description) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      {/* Frame 2043683081 (node 60:2107): колонка, gap 60px — жёлтая карточка, «Подойдет для вас», «Направления» */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[60px] flex flex-col">
        {/* Верхняя карточка: название и цвет по выбранной тренировке */}
        <SkillCourseCard
          imageSrc={course.imageSkillCard}
          title={course.title}
          slug={course.slug}
        />

        {/* Подойдет для вас: от заголовка до карточек 40px; от карточек до «Направления» 60px */}
        <section
          className="w-full max-w-[1160px] flex flex-col gap-[40px] mt-8 sm:mt-[60px]"
          aria-labelledby="suits-heading"
        >
          <h2
            id="suits-heading"
            className="text-left"
            style={{
              width: 810,
              maxWidth: '100%',
              height: 44,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '40px',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            Подойдет для вас, если:
          </h2>
          <div
            className="flex flex-row flex-wrap items-stretch"
            style={{ gap: 17 }}
          >
            {description.suits.map((text, i) => (
              <div
                key={i}
                className="rounded-[28px] flex flex-col justify-start items-start min-w-0 flex-1 box-border overflow-hidden"
                style={{
                  minWidth: 0,
                  flex: '1 1 280px',
                  maxWidth: '100%',
                  height: 141,
                  minHeight: 141,
                  padding: 20,
                  gap: 10,
                  background:
                    'linear-gradient(152.61deg, rgba(21.46, 23.48, 31.57, 1), rgba(30.28, 33.45, 46.14, 1))',
                }}
              >
                <div
                  className="flex flex-row justify-start items-center flex-1 min-w-0 w-full box-border"
                  style={{ gap: 25 }}
                >
                  {/* Цифра: Roboto Medium 75px, 135%, цвет #BCEC30 */}
                  <span
                    className="shrink-0 leading-[1.35]"
                    style={{
                      color: 'rgba(188, 236, 48, 1)',
                      fontFamily: 'Roboto, sans-serif',
                      fontWeight: 500,
                      fontSize: 'clamp(48px, 10vw, 75px)',
                      letterSpacing: 0,
                      textAlign: 'left',
                    }}
                  >
                    {i + 1}
                  </span>
                  {/* Текст по макету: 268×78, white, Roboto Regular 24px, 110%, 400 */}
                  <span
                    className="min-w-0 flex-1 break-words block text-left"
                    style={{
                      width: 268,
                      maxWidth: '100%',
                      minHeight: 78,
                      color: 'rgba(255, 255, 255, 1)',
                      fontFamily: 'Roboto, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '24px',
                      lineHeight: '110%',
                      letterSpacing: 0,
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
        <div className="w-full max-w-[1160px] flex flex-col gap-[40px] mt-[60px]">
          <h2
            className="text-left"
            style={{
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '40px',
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
            className="w-full max-w-[1160px] min-h-[146px] rounded-[28px] p-4 sm:p-[30px] box-border flex flex-col justify-start items-start overflow-hidden"
            style={{
              gap: 10,
              backgroundColor: 'rgba(188, 236, 48, 1)',
            }}
          >
            <div
              className="w-full min-w-0 flex flex-col gap-y-[34px] lg:grid lg:grid-rows-2 lg:grid-flow-col lg:gap-x-[158px] lg:gap-y-[34px] lg:content-start"
            >
              {description.directions.map((name) => (
                <div
                  key={name}
                  className="flex flex-row items-start gap-2 sm:gap-[8px] min-w-0 w-full"
                >
                  <StarIcon className="w-5 h-5 sm:w-[26px] sm:h-[26px] shrink-0 flex-shrink-0 mt-0.5" />
                  <span
                    className="text-lg sm:text-[24px] font-normal leading-[1.1] min-w-0 break-words"
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
      <section className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pb-12 sm:pb-[90px]">
        <div
          className="relative w-full max-w-[1160px] overflow-hidden"
          style={{ minHeight: 588 }}
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
              className="flex flex-row justify-center items-center shrink-0 hover:opacity-90 transition-opacity"
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
              Войдите, чтобы добавить курс
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
                transform: 'rotate(-2.99deg)',
                transformOrigin: 'top left',
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
                transform: 'rotate(-2.99deg)',
                transformOrigin: 'top left',
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
      </section>
    </div>
  )
}
