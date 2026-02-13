import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { getCourseBySlug } from '@/data/courses'
import { getLessonByCourseAndLessonId } from '@/data/lessons'

type ExerciseDef = {
  key: 'forward' | 'backward' | 'knees'
  label: string
  question: string
}

type ExerciseItem = {
  id: string
  key: ExerciseDef['key']
  label: string
  question: string
}

const BASE_EXERCISES: ExerciseDef[] = [
  {
    key: 'forward',
    label: 'Наклоны вперед',
    question: 'Сколько раз вы сделали наклоны вперед?',
  },
  {
    key: 'backward',
    label: 'Наклоны назад',
    question: 'Сколько раз вы сделали наклоны назад?',
  },
  {
    key: 'knees',
    label: 'Поднятие ног, согнутых в коленях',
    question: 'Сколько раз вы сделали поднятие ног, согнутых в коленях?',
  },
]

const EXERCISE_ITEMS: ExerciseItem[] = Array.from({ length: 9 }, (_, idx) => {
  const base = BASE_EXERCISES[idx % BASE_EXERCISES.length]
  const blockIndex = Math.floor(idx / BASE_EXERCISES.length) + 1
  return {
    id: `${base.key}-${blockIndex}`,
    key: base.key,
    label: base.label,
    question: base.question,
  }
})

const INITIAL_EXERCISE_PROGRESS: Record<string, number> = Object.fromEntries(
  EXERCISE_ITEMS.map((item) => [item.id, 0]),
)

const INITIAL_DRAFT_PROGRESS: Record<string, string> = Object.fromEntries(
  EXERCISE_ITEMS.map((item) => [item.id, '0']),
)

export function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()

  const course = slug ? getCourseBySlug(slug) : undefined
  const lesson = slug && lessonId ? getLessonByCourseAndLessonId(slug, lessonId) : undefined
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressSavedModalOpen, setProgressSavedModalOpen] = useState(false)
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, number>>(
    INITIAL_EXERCISE_PROGRESS,
  )
  const [draftProgress, setDraftProgress] = useState<Record<string, string>>(
    INITIAL_DRAFT_PROGRESS,
  )
  const progressListRef = useRef<HTMLDivElement>(null)
  const [progressScroll, setProgressScroll] = useState({
    hasOverflow: false,
    thumbTop: 0,
    thumbHeight: 116,
  })

  if (!course || !lesson) {
    return <Navigate to="/profile" replace />
  }

  const openProgressModal = () => {
    setDraftProgress(
      Object.fromEntries(
        EXERCISE_ITEMS.map((item) => [item.id, String(exerciseProgress[item.id] ?? 0)]),
      ),
    )
    setProgressModalOpen(true)
  }

  const closeProgressModal = () => setProgressModalOpen(false)

  const saveProgress = () => {
    const normalize = (value: string) => {
      const num = Number(value.replace(/[^\d]/g, ''))
      if (!Number.isFinite(num)) return 0
      return Math.min(100, Math.max(0, num))
    }

    setExerciseProgress(
      Object.fromEntries(
        EXERCISE_ITEMS.map((item) => [item.id, normalize(draftProgress[item.id] ?? '0')]),
      ),
    )
    setProgressModalOpen(false)
    setProgressSavedModalOpen(true)
  }

  const closeProgressSavedModal = () => setProgressSavedModalOpen(false)

  useEffect(() => {
    if (!progressModalOpen && !progressSavedModalOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [progressModalOpen, progressSavedModalOpen])

  useEffect(() => {
    if (!progressModalOpen) return
    const el = progressListRef.current
    if (!el) return

    const update = () => {
      const viewportHeight = el.clientHeight
      const contentHeight = el.scrollHeight
      const hasOverflow = contentHeight > viewportHeight + 1

      if (!hasOverflow) {
        setProgressScroll({
          hasOverflow: false,
          thumbTop: 0,
          thumbHeight: viewportHeight,
        })
        return
      }

      const thumbHeight = Math.max(
        116,
        Math.min(viewportHeight, (viewportHeight / contentHeight) * viewportHeight),
      )
      const maxScrollTop = Math.max(1, contentHeight - viewportHeight)
      const maxThumbTop = Math.max(0, viewportHeight - thumbHeight)
      const thumbTop = (el.scrollTop / maxScrollTop) * maxThumbTop

      setProgressScroll({
        hasOverflow: true,
        thumbTop,
        thumbHeight,
      })
    }

    const onScroll = () => update()
    el.addEventListener('scroll', onScroll, { passive: true })

    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild)
    }
    window.addEventListener('resize', update)

    update()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      ro.disconnect()
    }
  }, [progressModalOpen])

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[39px] sm:pt-[49px] pb-12">
        <div className="max-w-[1160px] flex flex-col gap-[40px]">
          <div className="flex items-center gap-4 flex-wrap">
            <h1
              className="text-left text-[40px] leading-[1.1] text-black"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}
            >
              {course.title}
            </h1>
          </div>

          <section className="flex flex-col gap-5">
            <div
              className="relative w-full max-w-[1160px] lg:h-[639px] rounded-[30px] overflow-hidden shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] bg-[#ECECEC]"
              style={{ minHeight: 260 }}
            >
              {!videoLoaded && (
                <div className="absolute inset-0 z-[5]">
                  <img
                    src="/images/ph.png"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.96)' }}
                  />
                  <div className="absolute inset-0 bg-white/12" />
                </div>
              )}
              <iframe
                className="relative z-0 w-full h-full min-h-[260px]"
                src={lesson.youtubeEmbedUrl}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                onLoad={() => setVideoLoaded(true)}
              />
              {/* Центральный знак воспроизведения по макету */}
              <div
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                aria-hidden
              >
                <img
                  src="/images/play.svg"
                  alt=""
                  width={156}
                  height={156}
                  className="w-[156px] h-[156px] object-contain"
                />
              </div>
            </div>
          </section>

          <section
            className="w-full rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
            style={{
              maxWidth: 1160,
              minHeight: 375,
              padding: 40,
              marginBottom: 260,
              marginTop: 8,
            }}
          >
            <div
              className="flex flex-col"
              style={{
                width: '100%',
                maxWidth: 1080,
                minHeight: 295,
                gap: 40,
              }}
            >
              <div className="flex flex-col" style={{ gap: 20 }}>
                <h2
                  style={{
                    width: '100%',
                    maxWidth: 403,
                    color: 'rgba(0, 0, 0, 1)',
                    fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: 'clamp(28px, 3.2vw, 32px)',
                    lineHeight: '110%',
                    letterSpacing: 0,
                    textAlign: 'left',
                  }}
                >
                  Упражнения тренировки 2
                </h2>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start"
                  style={{ gap: 40 }}
                >
                  {[0, 1, 2].map((col) => (
                    <div key={col} className="flex flex-col" style={{ gap: 20, width: '100%', maxWidth: 333 }}>
                      {EXERCISE_ITEMS.slice(col * 3, col * 3 + 3).map((item) => {
                        const progress = exerciseProgress[item.id] ?? 0
                        return (
                          <div key={item.id} className="flex flex-col" style={{ gap: 10 }}>
                            <span
                              style={{
                                color: 'rgba(0, 0, 0, 1)',
                                fontFamily: 'Roboto, sans-serif',
                                fontStyle: 'normal',
                                fontWeight: 400,
                                fontSize: 18,
                                lineHeight: '110%',
                                letterSpacing: 0,
                                textAlign: 'left',
                                whiteSpace: 'normal',
                              }}
                            >
                              {`${item.label} ${progress}%`}
                            </span>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: 333,
                                height: 6,
                                borderRadius: 50,
                                background: 'rgba(234, 234, 234, 1)',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${progress}%`,
                                  height: '100%',
                                  borderRadius: 50,
                                  background: 'rgba(0, 193, 255, 1)',
                                  transition: 'width 300ms ease-out',
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={openProgressModal}
                className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity"
                style={{
                  width: '100%',
                  maxWidth: 274,
                  height: 52,
                  padding: '16px 26px',
                  background: 'rgba(188, 236, 48, 1)',
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '110%',
                  letterSpacing: 0,
                  textAlign: 'center',
                }}
              >
                Заполнить свой прогресс
              </button>
            </div>
          </section>

        </div>
      </main>
      {progressModalOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 px-4"
          onClick={closeProgressModal}
        >
          <div
            className="bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] rounded-[20px] flex flex-col"
            style={{ width: 460, height: 609, padding: 40, gap: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 48,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
                marginBottom: 48,
              }}
            >
              Мой прогресс
            </h3>

            <div className="relative" style={{ flex: 1, minHeight: 0 }}>
              <div
                ref={progressListRef}
                className="lesson-picker-scroll-hide overflow-y-auto overflow-x-hidden"
                style={{ height: '100%', minHeight: 0, paddingRight: 24 }}
              >
                <div className="flex flex-col" style={{ gap: 20 }}>
                  {EXERCISE_ITEMS.map((item) => (
                    <div key={item.id} className="flex flex-col" style={{ gap: 10 }}>
                      <label
                        style={{
                          color: 'rgba(0, 0, 0, 1)',
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 18,
                          lineHeight: '110%',
                          letterSpacing: 0,
                          textAlign: 'left',
                        }}
                      >
                        {item.question}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={draftProgress[item.id] ?? '0'}
                        onChange={(e) =>
                          setDraftProgress((prev) => ({
                            ...prev,
                            [item.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-[10px] border border-[#C4C4C4] bg-white px-5"
                        style={{
                          height: 52,
                          color: 'rgba(0, 0, 0, 1)',
                          fontFamily: 'Roboto, sans-serif',
                          fontWeight: 400,
                          fontSize: 30 - 10,
                          lineHeight: '110%',
                          letterSpacing: 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {progressScroll.hasOverflow && (
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
                      pointerEvents: 'none',
                    }}
                  />
                  <div
                    aria-hidden
                    style={{
                      position: 'absolute',
                      top: progressScroll.thumbTop,
                      right: 0,
                      width: 6,
                      height: progressScroll.thumbHeight,
                      borderRadius: 10,
                      background: 'rgba(0, 0, 0, 1)',
                      pointerEvents: 'none',
                    }}
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={saveProgress}
              className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity"
              style={{
                width: 380,
                height: 52,
                alignSelf: 'center',
                marginTop: 34,
                background: 'rgba(188, 236, 48, 1)',
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 36 - 18,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'center',
              }}
            >
              Сохранить
            </button>
          </div>
        </div>
      )}
      {progressSavedModalOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-center justify-center px-4"
          onClick={closeProgressSavedModal}
        >
          <div
            className="rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center"
            style={{ width: 426, height: 270, gap: 34, padding: 40 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: 0,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: 40,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'center',
              }}
            >
              Ваш прогресс
              <br />
              засчитан!
            </h3>
            <img
              src="/images/Check-in-Circle.svg"
              alt=""
              width={68}
              height={68}
              className="w-[68px] h-[68px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
