import { useParams, Navigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { SkillCourseCard } from '@/components/SkillCourseCard'
import { WorkoutCard } from '@/components/WorkoutCard'
import { getCourseBySlug, COURSE_COLORS } from '@/data/courses'

/** Моковые тренировки для курса (позже заменить на GET /courses/[courseId]/workouts) */
const MOCK_WORKOUTS: Record<string, { name: string }[]> = {
  yoga: [
    { name: 'Урок 1. Введение в йогу' },
    { name: 'Урок 2. Основные движения' },
    { name: 'Урок 3. Дыхание и расслабление' },
  ],
  stretching: [
    { name: 'Урок 1. Базовый стретчинг' },
    { name: 'Урок 2. Растяжка спины' },
  ],
  fitness: [{ name: 'Урок 1. Разминка' }, { name: 'Урок 2. Силовая часть' }],
  step: [{ name: 'Урок 1. Базовый степ' }, { name: 'Урок 2. Связки' }],
  bodyflex: [{ name: 'Урок 1. Дыхание' }, { name: 'Урок 2. Бодифлекс' }],
}

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

function SparcleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M13 2l2.5 7.5L23 12l-7.5 2.5L13 22l-2.5-7.5L3 12l7.5-2.5L13 2z"
        fill="currentColor"
      />
    </svg>
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
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[60px] pb-10 sm:pb-[60px] flex flex-col gap-8 sm:gap-[60px]">
        {/* Верхняя карточка: название и цвет по выбранной тренировке */}
        <SkillCourseCard
          imageSrc={course.imageSkillCard}
          title={course.title}
        />

        {/* Блок по макету Figma node 60-2105: от заголовка до карточек 40px, между карточками 17px */}
        <section
          className="w-full max-w-[1160px] flex flex-col gap-[40px]"
          aria-labelledby="suits-heading"
        >
          <h2
            id="suits-heading"
            className="text-left"
            style={{
              width: 810,
              maxWidth: '100%',
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 600,
              fontSize: '40px',
              lineHeight: '110%',
              letterSpacing: 0,
            }}
          >
            Подойдет для вас, если:
          </h2>
          <div
            className="flex flex-row flex-wrap md:flex-nowrap items-stretch"
            style={{ gap: 17 }}
          >
            {description.suits.map((text, i) => (
              <div
                key={i}
                className="rounded-[28px] flex flex-col justify-start items-start min-w-0 md:flex-1 shrink-0 box-border"
                style={{
                  width: 368,
                  maxWidth: '100%',
                  minHeight: 141,
                  padding: 20,
                  gap: 10,
                  background:
                    'linear-gradient(152.61deg, rgba(21.46, 23.48, 31.57, 1), rgba(30.28, 33.45, 46.14, 1))',
                }}
              >
                {/* Frame 2043683006: 328×101, flex col, gap 3 */}
                <div
                  className="flex flex-col justify-start items-start flex-1 min-w-0"
                  style={{ width: 328, maxWidth: '100%', gap: 3 }}
                >
                  {/* Frame 2043683005: 328×101, flex row, gap 25; отступы 20 — у внешнего слоя (padding 20) */}
                  <div
                    className="flex flex-row justify-start items-center flex-1 min-w-0 box-border"
                    style={{ width: 328, maxWidth: '100%', gap: 25 }}
                  >
                    {/* Цифра: 35×101, Roboto Medium 75px, 135%, цвет #BCEC30 */}
                    <span
                      className="shrink-0 text-left"
                      style={{
                        width: 35,
                        height: 101,
                        color: 'rgba(188, 236, 48, 1)',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 500,
                        fontSize: 75,
                        lineHeight: '135%',
                        letterSpacing: 0,
                      }}
                    >
                      {i + 1}
                    </span>
                    {/* Текст по макету: 268×78, white, Roboto Regular 24px, 110%, 0 letter-spacing, left */}
                    <span
                      className="shrink-0"
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
              </div>
            ))}
          </div>
        </section>

        {/* Frame 2043683080: column gap 40. Заголовок «Направления» 40px. Frame 2043683031: width 1160, #BCEC30, padding 30, radius 28; внутри row gap 124px — две колонки, в колонке gap 34px; элемент: row gap 8px, Sparcle 26×26 white, текст 24px black, width 250 */}
        <div className="w-full max-w-[1160px] flex flex-col gap-[40px]">
          <h2 className="text-[40px] font-semibold leading-[1.1] text-[#000000]">
            Направления
          </h2>
          <div
            className="w-full max-w-[1160px] rounded-[28px] p-[30px] box-border"
            style={{ backgroundColor: COURSE_COLORS[course.slug] ?? '#BCEC30' }}
          >
            <div className="flex flex-row gap-[124px] flex-wrap">
              {[
                description.directions.slice(
                  0,
                  Math.ceil(description.directions.length / 2)
                ),
                description.directions.slice(
                  Math.ceil(description.directions.length / 2)
                ),
              ].map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[34px]">
                  {col.map((name) => (
                    <div
                      key={name}
                      className="flex flex-row items-center gap-[8px]"
                    >
                      <SparcleIcon className="w-[26px] h-[26px] shrink-0 text-white" />
                      <span className="text-[24px] font-normal leading-[1.1] text-[#000000] w-[250px]">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Тренировки: карточки по макету Figma 46:2743 (в т.ч. бодифлекс); кнопка — node 33:2051 */}
        <div className="w-full max-w-[1160px] flex flex-col gap-8 sm:gap-[40px]">
          <h2 className="text-[32px] sm:text-[40px] font-semibold leading-[1.1] text-[#000000]">
            Тренировки
          </h2>
          <div className="flex flex-col gap-4 sm:gap-[17px]">
            {(MOCK_WORKOUTS[course.slug] ?? []).map((workout) => (
              <WorkoutCard key={workout.name} name={workout.name} />
            ))}
            <button
              type="button"
              className="flex items-center justify-center gap-3 w-full min-h-[72px] rounded-[20px] transition-opacity hover:opacity-90"
              style={{
                backgroundColor: COURSE_COLORS[course.slug] ?? '#BCEC30',
              }}
              aria-label="Добавить тренировку"
            >
              <img
                src="/images/add-workout-button.svg"
                alt=""
                width={32}
                height={32}
                className="shrink-0"
                aria-hidden
              />
              <span className="text-[24px] font-normal leading-[1.1] text-[#000000]">
                Добавить тренировку
              </span>
            </button>
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
