import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { getCourseBySlug, type Course } from '@/data/courses'
import { getCourseProgressMap } from '@/data/courseProgress'
import { getLessonsByCourseSlug } from '@/data/lessons'

const PURCHASED_COURSE_SLUGS = ['yoga', 'stretching', 'fitness'] as const

function ProfileCourseCard({
  course,
  progress,
  onRemove,
  onOpenLessonPicker,
}: {
  course: Course
  progress: number
  onRemove?: () => void
  onOpenLessonPicker?: (course: Course) => void
}) {
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
      className="relative w-[343px] sm:w-[360px] min-h-[649px] shrink-0 group overflow-visible card-hover-group"
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
          className="absolute rounded-full flex items-center justify-center sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-110 shrink-0"
          style={{
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            background: 'transparent',
            cursor: "url('/images/cursor.svg') 0 0, auto",
          }}
          onClick={(e) => {
            e.stopPropagation()
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
          <img src="/images/minus_svg.svg" alt="" className="w-full h-full object-contain pointer-events-none" style={{ filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>
      <div className="flex flex-col gap-[20px] sm:gap-[40px] px-6 w-full items-start">
        <div className="flex flex-col w-full max-w-[300px]" style={{ gap: 20 }}>
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
              <span className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <img src="/images/calendar-icon.svg" alt="" className="w-[18px] h-[18px]" />
                25 дней
              </span>
              <span className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <img src="/images/time-icon.svg" alt="" className="w-[18px] h-[18px]" />
                20-50 мин/день
              </span>
            </div>
            <div className="flex flex-wrap gap-[6px]">
              <span className="inline-flex items-center gap-[6px] rounded-[50px] bg-[#F7F7F7] px-[10px] py-[10px] text-[16px] leading-[1.1] text-[#202020]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <img src="/images/signal-icon.svg" alt="" className="w-[18px] h-[18px]" />
                Сложность
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-[10px] w-full max-w-[300px]">
          <p className="text-[18px] leading-[1.1] text-black text-left" style={{ fontFamily: 'Roboto, sans-serif' }}>Прогресс {progress}%</p>
          <div className="h-[6px] w-full max-w-[300px] rounded-[50px] bg-[#D9D9D9] overflow-hidden">
            <div
              className="h-full rounded-[50px] transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'rgba(0, 193, 255, 1)',
              }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenLessonPicker?.(course)}
          className="w-full max-w-[300px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black font-normal sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-[1.03]"
          style={{
            backgroundColor: '#BCEC30',
            fontFamily: 'Roboto, sans-serif',
            padding: '16px 26px',
          }}
        >
          {progressLabel}
        </button>
      </div>
      </article>
      {tooltipVisible && (
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

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, openLoginModal } = useAuth()
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>(
    () => getCourseProgressMap(),
  )
  const [lessonPickerCourse, setLessonPickerCourse] = useState<Course | null>(null)
  const [lessonPickerVisible, setLessonPickerVisible] = useState(false)
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const lessonListRef = useRef<HTMLDivElement>(null)
  const lessonPickerCloseTimerRef = useRef<number | null>(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(116)
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    if (!user) {
      openLoginModal()
      navigate('/', { replace: true })
    }
  }, [user, openLoginModal, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const openLessonPicker = (course: Course) => {
    if (lessonPickerCloseTimerRef.current) {
      window.clearTimeout(lessonPickerCloseTimerRef.current)
      lessonPickerCloseTimerRef.current = null
    }
    const lessons = getLessonsByCourseSlug(course.slug)
    setLessonPickerCourse(course)
    setSelectedLessonIds(lessons[0]?.id ? [lessons[0].id] : [])
    requestAnimationFrame(() => setLessonPickerVisible(true))
  }

  const closeLessonPicker = () => {
    setLessonPickerVisible(false)
    if (lessonPickerCloseTimerRef.current) {
      window.clearTimeout(lessonPickerCloseTimerRef.current)
    }
    lessonPickerCloseTimerRef.current = window.setTimeout(() => {
      setLessonPickerCourse(null)
      setSelectedLessonIds([])
      lessonPickerCloseTimerRef.current = null
    }, 240)
  }

  useEffect(() => {
    if (!lessonPickerCourse) return
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [lessonPickerCourse])

  const startSelectedLesson = () => {
    if (!lessonPickerCourse || selectedLessonIds.length === 0) return
    const firstSelected = pickerLessons.find((lesson) =>
      selectedLessonIds.includes(lesson.id),
    )
    if (!firstSelected) return
    navigate(`/course/${lessonPickerCourse.slug}/lesson/${firstSelected.id}`)
    closeLessonPicker()
  }

  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId],
    )
  }

  const updateCustomScrollbar = () => {
    const el = lessonListRef.current
    if (!el) {
      setHasOverflow(false)
      setThumbTop(0)
      setThumbHeight(116)
      return
    }
    const viewportHeight = el.clientHeight
    const contentHeight = el.scrollHeight
    const overflow = contentHeight > viewportHeight + 1

    setHasOverflow(overflow)
    if (!overflow) {
      setThumbTop(0)
      setThumbHeight(viewportHeight)
      return
    }

    const computedThumbHeight = Math.max(
      116,
      Math.min(viewportHeight, (viewportHeight / contentHeight) * viewportHeight),
    )
    const maxScroll = Math.max(1, contentHeight - viewportHeight)
    const maxThumbTop = Math.max(0, viewportHeight - computedThumbHeight)
    const nextTop = (el.scrollTop / maxScroll) * maxThumbTop
    setThumbHeight(computedThumbHeight)
    setThumbTop(nextTop)
  }

  const purchasedWithCourse = PURCHASED_COURSE_SLUGS.map((slug) => {
    const course = getCourseBySlug(slug)
    const progress = courseProgressMap[slug] ?? 0
    return course ? { course, progress } : null
  }).filter(Boolean) as { course: Course; progress: number }[]
  const pickerLessons = lessonPickerCourse
    ? getLessonsByCourseSlug(lessonPickerCourse.slug)
    : []
  const lessonSeriesTitle =
    lessonPickerCourse?.slug === 'yoga'
      ? 'Йога на каждый день'
      : `${lessonPickerCourse?.title ?? ''} на каждый день`

  useEffect(() => {
    const raf = requestAnimationFrame(updateCustomScrollbar)
    return () => cancelAnimationFrame(raf)
  }, [lessonPickerCourse, pickerLessons.length])

  useEffect(() => {
    const onResize = () => updateCustomScrollbar()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      if (lessonPickerCloseTimerRef.current) {
        window.clearTimeout(lessonPickerCloseTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const syncProgress = () => setCourseProgressMap(getCourseProgressMap())
    const onStorage = () => syncProgress()
    const onFocus = () => syncProgress()
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (!user) return null

  return (
    <div id="top" className="min-h-screen bg-[#FAFAFA] font-sans text-black">
      <Header />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[50px] sm:pt-[95px] pb-0 sm:pb-12">
        <div className="flex flex-col gap-[24px] sm:gap-[60px] max-w-[1160px]">
          {/* Блок «Профиль» — плашка по макету 60-1707 */}
          <section className="flex flex-col gap-[24px] sm:gap-[40px]">
            <h1
              className="text-left font-medium text-[24px] sm:text-[40px] leading-[1.1] text-black max-w-[810px]"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Профиль
            </h1>
            <div className="flex flex-col items-center gap-[30px] p-[30px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] w-[343px] h-[365px] sm:w-full sm:h-auto max-w-[1160px] mx-auto sm:mx-0">
              <div className="flex flex-col sm:flex-row flex-wrap items-center gap-0 sm:gap-[33px] w-full">
                <div className="mx-auto sm:mx-0 w-[141px] h-[141px] sm:w-[197px] sm:h-[197px] shrink-0 overflow-hidden rounded-[30px] bg-[#D9D9D9]">
                  <img
                    src="/images/photo_big.png"
                    alt=""
                    className="w-full h-full object-cover"
                    width={197}
                    height={197}
                  />
                </div>
                <div className="mt-[30px] sm:mt-0 w-full flex flex-col items-start gap-[20px] sm:gap-[44px] min-w-0">
                  <div className="flex flex-col gap-[20px] w-full items-start">
                    <p
                      className="text-left font-medium text-[24px] sm:text-[32px] leading-[1.1] text-black max-w-[300px]"
                      style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-left text-[18px] leading-[1.1] text-black"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Логин: {user.login}
                    </p>
                  </div>
                  <div className="flex w-full items-center justify-center sm:justify-start gap-2.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="box-border flex flex-row justify-center items-center gap-[10px] rounded-[46px] border border-black w-[283px] h-[50px] sm:w-[192px] sm:h-[53px] text-[16px] sm:text-[18px] leading-[1.1] text-black font-normal hover:bg-black/5 transition-colors px-[26px] py-[16px]"
                      style={{ fontFamily: 'Roboto, sans-serif', borderWidth: 1 }}
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Блок «Мои курсы» */}
          <section className="flex flex-col gap-[40px]">
            <h2
              className="text-left font-medium text-[24px] sm:text-[40px] leading-[1.1] text-black max-w-[810px]"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Мои курсы
            </h2>
            <div className="flex flex-row flex-wrap gap-6 sm:gap-[40px] overflow-visible">
              {purchasedWithCourse.map(({ course, progress }) => (
                <ProfileCourseCard
                  key={course.slug}
                  course={course}
                  progress={progress}
                  onRemove={() => {}}
                  onOpenLessonPicker={openLessonPicker}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[24px] sm:pt-0 pb-12 sm:pb-16">
        <div className="w-full max-w-[343px] sm:max-w-none mx-auto flex justify-end sm:justify-center">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-all duration-300 ease-out hover:scale-[1.03] shrink-0"
            style={{
              width: 127,
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
            <span className="inline-flex flex-row items-baseline gap-1">
              Наверх
              <span className="inline-block -translate-y-1" aria-hidden>
                ↑
              </span>
            </span>
          </a>
        </div>
      </footer>
      {lessonPickerCourse && (
        <div
          className={`fixed inset-0 z-[120] flex items-center justify-center px-4 transition-opacity duration-300 ${
            lessonPickerVisible
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'rgba(0, 0, 0, 0.35)' }}
          onClick={closeLessonPicker}
        >
          <div
            className={`rounded-[40px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-start transition-all duration-300 ease-out ${
              lessonPickerVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-95'
            }`}
            style={{
              width: 'min(343px, calc(100vw - 24px))',
              height: 'min(585px, calc(100vh - 24px))',
              gap: 34,
              padding: 30,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                width: '100%',
                maxWidth: 303,
                minHeight: 35,
                margin: 0,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 'clamp(28px, 5vw, 32px)',
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
              }}
            >
              Выберите тренировку
            </h3>

            <div className="relative w-[283px] h-[335px]">
              <div
                ref={lessonListRef}
                onScroll={updateCustomScrollbar}
                className="lesson-picker-scroll-hide flex flex-col items-start overflow-y-scroll overflow-x-hidden"
                style={{ width: 283, height: 335, paddingRight: 26 }}
              >
                {pickerLessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col items-start w-full"
                    style={{ maxWidth: 303, marginTop: index === 0 ? 0 : 10 }}
                  >
                    <label
                      className="flex items-start gap-3 cursor-pointer overflow-hidden"
                      style={{
                        width: '100%',
                        padding: '0 0 9.5px 0',
                        borderBottom:
                          index < pickerLessons.length - 1
                            ? '1px solid rgba(196, 196, 196, 1)'
                            : 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      <input
                        type="checkbox"
                        name="lesson"
                        value={lesson.id}
                        checked={selectedLessonIds.includes(lesson.id)}
                        onChange={() => toggleLessonSelection(lesson.id)}
                        className="sr-only"
                      />
                      {selectedLessonIds.includes(lesson.id) ? (
                        <img
                          src="/images/active.svg"
                          alt=""
                          width={24}
                          height={24}
                          className="mt-[10.5px] shrink-0"
                          aria-hidden
                        />
                      ) : (
                        <img
                          src="/images/pasive.svg"
                          alt=""
                          width={24}
                          height={24}
                          className="mt-[10.5px] shrink-0"
                          aria-hidden
                        />
                      )}
                      <span className="flex flex-col gap-[10px]">
                        <span
                          style={{
                            width: '100%',
                            maxWidth: 320,
                            minHeight: 26,
                            color: 'rgba(0, 0, 0, 1)',
                            fontFamily: 'Roboto, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 'clamp(20px, 4.6vw, 24px)',
                            lineHeight: '110%',
                            letterSpacing: 0,
                            textAlign: 'left',
                          }}
                        >
                          {lesson.title}
                        </span>
                        <span
                          style={{
                            width: '100%',
                            maxWidth: 320,
                            minHeight: 18,
                            color: 'rgba(0, 0, 0, 1)',
                            fontFamily: 'Roboto, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 'clamp(14px, 3.4vw, 16px)',
                            lineHeight: '110%',
                            letterSpacing: 0,
                            textAlign: 'left',
                          }}
                        >
                          {`${lessonSeriesTitle} / ${index + 1} день`}
                        </span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              {hasOverflow && (
                <>
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 6,
                      height: '100%',
                      borderRadius: 10,
                      background: 'rgba(247, 247, 247, 1)',
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: thumbTop,
                      right: 0,
                      width: 6,
                      height: thumbHeight,
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 1)',
                      transition: 'top 120ms linear, height 120ms linear',
                    }}
                  />
                </>
              )}
            </div>

            <div
              className="w-full flex items-center justify-center"
            >
              <button
                type="button"
                onClick={startSelectedLesson}
                className="rounded-[46px] bg-[#BCEC30] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{
                  width: 303,
                  height: 52,
                  fontFamily: 'Roboto, sans-serif',
                }}
                disabled={selectedLessonIds.length === 0}
              >
                Начать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
