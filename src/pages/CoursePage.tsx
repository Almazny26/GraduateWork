import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { SkillCourseCard } from '@/components/SkillCourseCard'
import { ProfileCoursesLoading } from '@/components/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi, type ApiCourse } from '@/api/fitness'
import { mapApiCourseToAppCourseRef } from '@/api/mappers'
import { logError, logInfo } from '@/utils/logger'

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

// описание курса режу на пункты по точкам/восклицательным и т.д.
function splitDescriptionToBullets(description?: string): string[] {
  if (!description) return []
  return description
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

// страница одного курса: большая карточка, описание, список уроков, кнопка добавить в профиль
export function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, token, openLoginModal, refreshMe } = useAuth()
  const [showcaseHovered, setShowcaseHovered] = useState(false)
  const [apiCourses, setApiCourses] = useState<ApiCourse[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [pendingAddCourse, setPendingAddCourse] = useState(false)
  const [addCourseLoading, setAddCourseLoading] = useState(false)

  useEffect(() => {
    setApiLoading(true)
    setApiError(null)
    logInfo('CoursePage', 'load course list started', { slug })
    fitnessApi
      .getCourses()
      .then((data) => {
        setApiCourses(data)
        logInfo('CoursePage', 'load course list success', { count: data.length, slug })
      })
      .catch((error) => {
        setApiCourses(null)
        setApiError('Не удалось загрузить список курсов.')
        logError('CoursePage', 'load course list failed', {
          slug,
          error: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => setApiLoading(false))
  }, [])

  const apiCourse = useMemo(() => {
    if (!slug || !apiCourses) return null
    return apiCourses.find((item) => mapApiCourseToAppCourseRef(item).slug === slug) ?? null
  }, [slug, apiCourses])
  const mappedCourse = useMemo(
    () => (apiCourse ? mapApiCourseToAppCourseRef(apiCourse) : null),
    [apiCourse],
  )

  useEffect(() => {
    if (apiLoading) return
    if (!slug || !apiCourses) return
    if (!apiCourse) {
      setApiError('Курс не найден в API.')
    }
  }, [apiLoading, slug, apiCourses, apiCourse])

  const courseContent = useMemo(() => {
    const bullets = splitDescriptionToBullets(apiCourse?.description)
    return {
      suits: apiCourse?.fitting ?? [],
      directions: apiCourse?.directions ?? [],
      heroTitle:
        bullets[0] ?? (apiCourse?.nameRU ? `Курс ${apiCourse.nameRU}` : 'Курс'),
      heroBullets: bullets.length > 1 ? bullets.slice(1) : [],
    }
  }, [apiCourse])

  const isSelectedByUser = !!(user && apiCourse && user.selectedCourses.includes(apiCourse._id))

  if (!slug) {
    return <Navigate to="/" replace />
  }

  const handleAddCourse = async () => {
    if (!user || !token) {
      setPendingAddCourse(true)
      toast('Войдите, чтобы добавить курс')
      openLoginModal()
      return
    }
    if (!apiCourse?._id) {
      toast.error('Курс не найден в API')
      return
    }
    if (isSelectedByUser) {
      toast('Курс уже добавлен')
      return
    }
    if (addCourseLoading) return

    setAddCourseLoading(true)
    logInfo('CoursePage', 'add course started', { slug, courseId: apiCourse._id })
    try {
      await fitnessApi.addCourseToUser(apiCourse._id, token)
      await refreshMe()
      setPendingAddCourse(false)
      toast.success('Курс добавлен в ваш профиль')
      logInfo('CoursePage', 'add course success', { slug, courseId: apiCourse._id })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось добавить курс'
      if (message.toLowerCase().includes('уже')) {
        await refreshMe()
        setPendingAddCourse(false)
        toast('Курс уже был добавлен')
        logInfo('CoursePage', 'add course already added', { slug, courseId: apiCourse._id })
      } else {
        toast.error(message)
        logError('CoursePage', 'add course failed', {
          slug,
          courseId: apiCourse._id,
          message,
        })
      }
    } finally {
      setAddCourseLoading(false)
    }
  }

  useEffect(() => {
    if (!pendingAddCourse || !user || !token) return
    if (!apiCourse?._id || isSelectedByUser) {
      setPendingAddCourse(false)
      return
    }
    fitnessApi
      .addCourseToUser(apiCourse._id, token)
      .then(() => refreshMe())
      .finally(() => setPendingAddCourse(false))
  }, [pendingAddCourse, user, token, apiCourse?._id, isSelectedByUser, refreshMe])

  if (apiLoading) {
    return (
      <div className="min-h-screen bg-page font-sans text-text overflow-x-hidden">
        <Header />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-10">
          <ProfileCoursesLoading label="Загружаем данные курса" />
        </div>
      </div>
    )
  }

  if (apiError || !apiCourse || !mappedCourse) {
    return (
      <div className="min-h-screen bg-page font-sans text-text overflow-x-hidden">
        <Header />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-10">
          <p style={{ fontFamily: 'Roboto, sans-serif' }}>
            {apiError ?? 'Курс не найден в API.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text overflow-x-hidden">
      <Header />
      {/* Frame 2043683081 (node 60:2107): колонка, gap 60px - жёлтая карточка, «Подойдет для вас», «Направления» */}
      <div className="relative z-0 max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[60px] flex flex-col">
        {/* Верхняя карточка: название и цвет по выбранной тренировке */}
        <SkillCourseCard
          imageSrc={mappedCourse.imageSkillCard}
          mobileImageSrc={mappedCourse.image}
          title={mappedCourse.title}
          slug={mappedCourse.slug}
        />

        {/* Подойдет для вас: от заголовка до карточек 40px; от карточек до «Направления» 60px */}
        <section
          className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]"
          aria-labelledby="suits-heading"
        >
          <h2
            id="suits-heading"
            className="text-left text-2xl sm:text-[40px] font-normal sm:font-semibold"
            style={{
              width: '100%',
              maxWidth: 810,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
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
            {courseContent.suits.map((text, i) => (
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
                  {/* Текст: мобильная 18px, sm+ 24px; Roboto Regular, 110%, 400 */}
                  <span
                    className="min-w-0 flex-1 break-words whitespace-pre-line block text-left font-normal text-[18px] sm:text-[24px]"
                    style={{
                      color: 'rgba(255, 255, 255, 1)',
                      fontFamily: 'Roboto',
                      fontStyle: 'normal',
                      fontWeight: 400,
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
            {courseContent.suits.length === 0 && (
              <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                Сервер пока не вернул рекомендации для этого курса.
              </p>
            )}
          </div>
        </section>

        {/* Направления: от карточек до этого блока 60px; от этого блока до «Тренировки» 40px */}
        <div className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]">
          <h2
            className="text-left text-2xl sm:text-[40px] font-normal sm:font-semibold"
            style={{
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontStyle: 'normal',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            Направления
          </h2>
          {/* Frame 2043683031: контент центрирован относительно блока (разное кол-во пунктов на страницах) */}
          <div
            className="w-[343px] sm:w-full max-w-[343px] sm:max-w-[1160px] h-auto min-h-0 py-[30px] sm:min-h-[146px] rounded-[28px] px-[30px] sm:p-[30px] box-border flex flex-col justify-center items-center overflow-hidden"
            style={{
              gap: 10,
              backgroundColor: 'rgba(188, 236, 48, 1)',
            }}
          >
            <div
              className="w-full min-w-0 max-w-[283px] flex flex-col justify-start items-start gap-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-x-8 sm:gap-y-4 lg:gap-x-12 lg:gap-y-6"
            >
              {courseContent.directions.map((name) => (
                <div
                  key={name}
                  className="flex flex-row items-center gap-2 sm:gap-[8px] min-w-0 shrink-0"
                >
                  <StarIcon className="w-[26px] h-[26px] shrink-0 flex-shrink-0" />
                  <span
                    className="text-[18px] sm:text-[24px] font-normal leading-[1.1] min-w-0 break-words"
                    style={{ color: 'rgba(0, 0, 0, 1)' }}
                  >
                    {name}
                  </span>
                </div>
              ))}
              {courseContent.directions.length === 0 && (
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Сервер пока не вернул направления для этого курса.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Group 1597880544: 1160×588 - по макету node 31-1394; 102px от верхнего блока */}
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
                img.src = mappedCourse.image
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
                {courseContent.heroTitle}
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
                {courseContent.heroBullets.map((line) => (
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
                onClick={handleAddCourse}
                disabled={addCourseLoading}
                className="w-full h-[52px] rounded-[46px] hover:opacity-90 hover:scale-[1.03] transition-all duration-300 ease-out flex items-center justify-center px-4 min-w-0 overflow-hidden"
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
                <span className="text-center min-w-0 break-words">
                  {!user
                    ? 'Войдите, чтобы добавить курс'
                    : isSelectedByUser
                      ? 'Курс уже добавлен'
                      : addCourseLoading
                        ? 'Добавляем...'
                        : 'Добавить курс'}
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

          {/* Frame 2043683032: 437×406, (40,142) - текст с сервера только в левой зоне, парень и линии справа на месте */}
          <div
            className="absolute flex flex-col justify-start items-start pointer-events-auto z-10"
            style={{
              left: 40,
              top: 142,
              width: 660,
              maxWidth: 660,
              height: 406,
              gap: 28,
              overflow: 'hidden',
            }}
          >
            {/* Заголовок: уменьшенный размер для длинных названий с сервера */}
            <h2
              className="text-left break-words shrink-0"
              style={{
                width: '100%',
                maxWidth: 660,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: 32,
                lineHeight: '110%',
                letterSpacing: 0,
              }}
            >
              {courseContent.heroTitle}
            </h2>
            {/* Список: колонка, каждый пункт с переносом текста на следующую строку */}
            <div
              className="flex flex-col gap-y-2 overflow-hidden min-h-0 flex-1 w-full"
              style={{
                maxWidth: 660,
                marginLeft: 5,
                opacity: 0.6,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
              }}
            >
              {courseContent.heroBullets.map((line) => (
                <div key={line} className="flex flex-row items-start gap-3 min-w-0 w-full">
                  <span
                    className="rounded-full shrink-0 w-[6px] h-[6px] mt-[6px]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
                    aria-hidden
                  />
                  <span className="break-words min-w-0 flex-1">{line}</span>
                </div>
              ))}
            </div>
            {/* Кнопка всегда внизу блока */}
            <button
              type="button"
              onClick={handleAddCourse}
              disabled={addCourseLoading}
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
              {!user
                ? 'Войдите, чтобы добавить курс'
                : isSelectedByUser
                  ? 'Курс уже добавлен'
                  : addCourseLoading
                    ? 'Добавляем...'
                    : 'Добавить курс'}
            </button>
          </div>

          {/* Конструкция (парень, силует, линии): под текстом (z-10), остаётся на месте */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
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
                  img.src = mappedCourse.image
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
