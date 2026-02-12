import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { getCourseBySlug, type Course } from '@/data/courses'
import { getLessonsByCourseSlug } from '@/data/lessons'

/** Мок: купленные курсы пользователя с прогрессом (0–100) */
const MOCK_PURCHASED: { slug: string; progress: number }[] = [
  { slug: 'yoga', progress: 40 },
  { slug: 'stretching', progress: 0 },
  { slug: 'fitness', progress: 100 },
]

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
      className="relative w-[360px] min-h-[649px] shrink-0 group overflow-visible card-hover-group"
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
          className="absolute rounded-full flex items-center justify-center hover:opacity-90 transition-transform duration-300 ease-out hover:scale-110 shrink-0"
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
      <div className="flex flex-col gap-[40px] px-6 w-full items-start">
        <div className="flex flex-col w-full max-w-[300px]" style={{ gap: 20 }}>
          <h3
            className="w-full font-stratos transition-transform duration-300 ease-out origin-left group-hover:scale-[1.03]"
            style={{
              fontWeight: 400,
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
        <div className="flex flex-col gap-[6px] w-full max-w-[300px]">
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
          className="w-full max-w-[300px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black font-normal hover:opacity-90 transition-transform duration-300 ease-out hover:scale-[1.03]"
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
  const [lessonPickerCourse, setLessonPickerCourse] = useState<Course | null>(null)
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const lessonListRef = useRef<HTMLDivElement>(null)
  const [thumbTop, setThumbTop] = useState(0)

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
    const lessons = getLessonsByCourseSlug(course.slug)
    setLessonPickerCourse(course)
    setSelectedLessonIds(lessons[0]?.id ? [lessons[0].id] : [])
  }

  const closeLessonPicker = () => {
    setLessonPickerCourse(null)
    setSelectedLessonIds([])
  }

  useEffect(() => {
    if (!lessonPickerCourse) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
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
    if (!el) return
    const maxScroll = Math.max(1, el.scrollHeight - el.clientHeight)
    const maxThumbTop = 359 - 116
    const nextTop = (el.scrollTop / maxScroll) * maxThumbTop
    setThumbTop(nextTop)
  }

  const purchasedWithCourse = MOCK_PURCHASED.map(({ slug, progress }) => {
    const course = getCourseBySlug(slug)
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
    updateCustomScrollbar()
  }, [lessonPickerCourse, pickerLessons.length])

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-black">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[50px] sm:pt-[95px] pb-12">
        <div className="flex flex-col gap-[60px] max-w-[1160px]">
          {/* Блок «Профиль» — плашка по макету 60-1707 */}
          <section className="flex flex-col gap-[40px]">
            <h1
              className="text-left font-semibold text-[40px] leading-[1.1] text-black max-w-[810px]"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}
            >
              Профиль
            </h1>
            <div className="flex flex-col p-[30px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] w-full max-w-[1160px]">
              <div className="flex flex-row flex-wrap items-center gap-[33px]">
                <div className="w-[197px] h-[197px] shrink-0 overflow-hidden rounded-[30px] bg-[#D9D9D9]">
                  <img
                    src="/images/photo_big.png"
                    alt=""
                    className="w-full h-full object-cover"
                    width={197}
                    height={197}
                  />
                </div>
                <div className="flex flex-col gap-[44px] min-w-0">
                  <div className="flex flex-col gap-[30px]">
                    <p
                      className="text-left font-medium text-[32px] leading-[1.1] text-black max-w-[300px]"
                      style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-[18px] leading-[1.1] text-black"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Логин: {user.login}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex justify-center items-center rounded-[46px] border border-black w-[192px] text-[18px] leading-[1.1] text-black font-normal hover:bg-black/5 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif', padding: '16px 26px', borderWidth: 1 }}
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
              className="text-left font-semibold text-[40px] leading-[1.1] text-black max-w-[810px]"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}
            >
              Мои курсы
            </h2>
            <div className="flex flex-row flex-wrap gap-[40px] overflow-visible">
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
      {lessonPickerCourse && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 px-4"
          onClick={closeLessonPicker}
        >
          <div
            className="rounded-[40px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center"
            style={{ width: 460, height: 609, gap: 0, padding: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                width: 346,
                height: 35,
                margin: 0,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 32,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
              }}
            >
              Выберите тренировку
            </h3>

            <div className="relative" style={{ width: 404, height: 359, marginTop: 48 }}>
              <div
                ref={lessonListRef}
                onScroll={updateCustomScrollbar}
                className="lesson-picker-scroll-hide flex flex-col items-start overflow-y-scroll overflow-x-hidden"
                style={{ width: 404, height: 359, paddingRight: 24 }}
              >
                {pickerLessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex flex-col items-start" style={{ width: 354 }}>
                    <label
                      className="flex items-start gap-3 cursor-pointer"
                      style={{ width: 354, padding: index === 0 ? '0 0 10px 0' : '10px 0' }}
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
                          className="mt-1 shrink-0"
                          aria-hidden
                        />
                      ) : (
                        <img
                          src="/images/pasive.svg"
                          alt=""
                          width={24}
                          height={24}
                          className="mt-1 shrink-0"
                          aria-hidden
                        />
                      )}
                      <span className="flex flex-col" style={{ gap: 10 }}>
                        <span
                          style={{
                            width: 320,
                            height: 26,
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
                          {lesson.title}
                        </span>
                        <span
                          style={{
                            width: 320,
                            height: 18,
                            color: 'rgba(0, 0, 0, 1)',
                            fontFamily: 'Roboto, sans-serif',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            fontSize: 16,
                            lineHeight: '110%',
                            letterSpacing: 0,
                            textAlign: 'left',
                          }}
                        >
                          {`${lessonSeriesTitle} / ${index + 1} день`}
                        </span>
                      </span>
                    </label>
                    {index < pickerLessons.length - 1 && (
                      <div
                        style={{
                          width: 354,
                          minWidth: 354,
                          maxWidth: 354,
                          height: 0,
                          border: '1px solid rgba(196, 196, 196, 1)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 6,
                  height: 359,
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
                  height: 116,
                  borderRadius: 10,
                  background: 'rgba(0, 0, 0, 1)',
                  transition: 'top 120ms linear',
                }}
              />
            </div>

            <div
              className="w-full flex items-center justify-center"
              style={{ marginTop: 2 }}
            >
              <button
                type="button"
                onClick={startSelectedLesson}
                className="rounded-[46px] bg-[#BCEC30] text-[18px] leading-[1.1] text-black hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{
                  width: 424,
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
