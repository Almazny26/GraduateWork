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
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[60px] pb-10 sm:pb-[60px] flex flex-col">
        {/* Верхняя карточка: название и цвет по выбранной тренировке */}
        <SkillCourseCard
          imageSrc={course.imageSkillCard}
          title={course.title}
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
        <div className="w-full max-w-[1160px] flex flex-col gap-[40px] mt-[60px] mb-[40px]">
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

      {/* Group 1597880544 (node 31:1394): 1160×588. Rectangle (0,102) 1160×486 white radius 30 shadow; Frame 2043683032 (40,142) column gap 28; Mask (615.19,0) 514.63×567 */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-8 sm:pt-[60px] pb-12 sm:pb-[90px]">
        <div className="relative w-full max-w-[1160px] h-[588px] overflow-hidden">
          {/* Белая карточка: по макету at (0,102), 1160×486, radius 30, shadow */}
          <div
            className="absolute left-0 w-full h-[486px] rounded-[30px] overflow-hidden"
            style={{
              top: '102px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
            }}
          />
          <div className="absolute inset-0 flex pointer-events-none">
            {/* Frame 2043683032: по макету (40, 142), column gap 28 */}
            <div className="pointer-events-auto w-[615px] min-w-0 pl-[40px] pt-[142px] pb-[40px] flex flex-col gap-[28px]">
              <h2 className="text-[60px] font-medium leading-[1em] text-[#000000]">
                {description.heroTitle}
              </h2>
              <ul className="list-none pl-0 flex flex-col gap-2 text-[24px] font-normal leading-[1.1] text-[#000000] opacity-60">
                {description.heroBullets.map((line) => (
                  <li key={line} className="flex items-center gap-3">
                    <span
                      className="rounded-full shrink-0 w-2 h-2"
                      style={{ backgroundColor: '#202020' }}
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full flex justify-center items-center gap-[10px] py-4 px-[26px] rounded-[46px] text-[18px] font-normal text-[#000000] hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: COURSE_COLORS[course.slug] ?? '#BCEC30',
                }}
              >
                Войдите, чтобы добавить курс
              </button>
            </div>
            {/* Изображение по макету at (615.19, 0), 514.63×567.15 */}
            <div className="flex-1 min-w-0 h-full overflow-hidden flex justify-end">
              <img
                src={course.image}
                alt=""
                className="h-[567px] w-[515px] object-cover object-center flex-shrink-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
