import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { ProfileCoursesLoading } from '@/components/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'
import { mapApiCourseToAppCourseRef, type AppCourseRef } from '@/api/mappers'
import { percentToReps, repsToPercent } from '@/utils/progress'
import { logError, logInfo } from '@/utils/logger'

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
  quantity: number
}

type SelectedLessonItem = {
  id: string
  title: string
}

function createExerciseProgress(
  items: ExerciseItem[],
  value: number,
): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, value]))
}

function createDraftProgress(items: ExerciseItem[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.id, '']))
}

export function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const location = useLocation()
  const { token, openLoginModal } = useAuth()

  const [courseRef, setCourseRef] = useState<AppCourseRef | null>(null)
  const [courseId, setCourseId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  const [exerciseItems, setExerciseItems] = useState<ExerciseItem[]>([])
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  const [progressSavedModalOpen, setProgressSavedModalOpen] = useState(false)
  const [progressSavedModalVisible, setProgressSavedModalVisible] = useState(false)
  const [isLessonLoading, setIsLessonLoading] = useState(true)
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null)
  const [exerciseProgress, setExerciseProgress] = useState<Record<string, number>>({})
  const [draftProgress, setDraftProgress] = useState<Record<string, string>>({})
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [selectedLessons, setSelectedLessons] = useState<SelectedLessonItem[]>([])
  const progressListRef = useRef<HTMLDivElement>(null)
  const [progressScroll, setProgressScroll] = useState({
    hasOverflow: false,
    thumbTop: 0,
    thumbHeight: 116,
  })
  const progressSavedCloseTimerRef = useRef<number | null>(null)
  const progressSavedUnmountTimerRef = useRef<number | null>(null)
  const progressModalUnmountTimerRef = useRef<number | null>(null)
  const selectedLessonIdsFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const raw = params.get('lessonIds') ?? ''
    if (!raw) return []
    return raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }, [location.search])

  const openProgressModal = () => {
    if (isLessonLoading || exerciseItems.length === 0 || isSavingProgress) return
    if (progressModalUnmountTimerRef.current) {
      window.clearTimeout(progressModalUnmountTimerRef.current)
      progressModalUnmountTimerRef.current = null
    }
    setDraftProgress(
      Object.fromEntries(
        exerciseItems.map((item) => {
          const percent = exerciseProgress[item.id] ?? 0
          const reps = percentToReps(percent, item.quantity)
          return [item.id, reps === 0 ? '' : String(reps)]
        }),
      ),
    )
    setProgressModalOpen(true)
  }

  const closeProgressModal = () => {
    setProgressModalVisible(false)
    if (progressModalUnmountTimerRef.current) {
      window.clearTimeout(progressModalUnmountTimerRef.current)
    }
    progressModalUnmountTimerRef.current = window.setTimeout(() => {
      setProgressModalOpen(false)
      progressModalUnmountTimerRef.current = null
    }, 240)
  }

  const saveProgress = async () => {
    if (isSavingProgress) return
    const normalizeReps = (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (!digits) return 0
      const num = Number(digits)
      if (!Number.isFinite(num)) return 0
      return Math.max(0, num)
    }
    const progressData = exerciseItems.map((item) => {
      const reps = normalizeReps(draftProgress[item.id] ?? '')
      const target = Math.max(1, item.quantity)
      return Math.min(reps, target)
    })
    const nextExerciseProgress = Object.fromEntries(
      exerciseItems.map((item, index) => [
        item.id,
        repsToPercent(progressData[index] ?? 0, item.quantity),
      ]),
    ) as Record<string, number>
    setExerciseProgress(nextExerciseProgress)
    logInfo('LessonPage', 'save progress started', {
      slug,
      lessonId,
      exercises: progressData.length,
    })
    setIsSavingProgress(true)
    let saveSucceeded = false

    try {
      if (courseId && lessonId && token) {
        await fitnessApi.saveWorkoutProgress(courseId, lessonId, progressData, token)
        logInfo('LessonPage', 'save progress success', { slug, lessonId, courseId })
        saveSucceeded = true
      }
    } catch (error) {
      logError('LessonPage', 'save progress failed', {
        slug,
        lessonId,
        courseId,
        error: error instanceof Error ? error.message : String(error),
      })
      toast.error('Не удалось сохранить прогресс. Проверьте интернет и попробуйте снова.')
    } finally {
      setIsSavingProgress(false)
    }

    if (!saveSucceeded) return

    setProgressModalVisible(false)
    if (progressModalUnmountTimerRef.current) {
      window.clearTimeout(progressModalUnmountTimerRef.current)
    }
    progressModalUnmountTimerRef.current = window.setTimeout(() => {
      setProgressModalOpen(false)
      progressModalUnmountTimerRef.current = null
      setProgressSavedModalOpen(true)
    }, 240)
  }

  const closeProgressSavedModal = () => {
    setProgressSavedModalVisible(false)
    if (progressSavedCloseTimerRef.current) {
      window.clearTimeout(progressSavedCloseTimerRef.current)
      progressSavedCloseTimerRef.current = null
    }
    if (progressSavedUnmountTimerRef.current) {
      window.clearTimeout(progressSavedUnmountTimerRef.current)
    }
    progressSavedUnmountTimerRef.current = window.setTimeout(() => {
      setProgressSavedModalOpen(false)
      progressSavedUnmountTimerRef.current = null
    }, 220)
  }

  useEffect(() => {
    if (!token) openLoginModal()
  }, [token, openLoginModal])

  useEffect(() => {
    if (!progressModalOpen && !progressSavedModalOpen) return
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
  }, [progressModalOpen, progressSavedModalOpen])

  useEffect(() => {
    if (!progressModalOpen) return
    const raf = requestAnimationFrame(() => setProgressModalVisible(true))
    return () => {
      cancelAnimationFrame(raf)
      setProgressModalVisible(false)
      if (progressModalUnmountTimerRef.current) {
        window.clearTimeout(progressModalUnmountTimerRef.current)
        progressModalUnmountTimerRef.current = null
      }
    }
  }, [progressModalOpen])

  useEffect(() => {
    if (!slug || !lessonId || !token) return
    let cancelled = false
    setIsLessonLoading(true)
    setLessonLoadError(null)
    setCourseRef(null)
    setCourseId(null)
    setLessonTitle('')
    setLessonVideoUrl('')
    setExerciseItems([])
    setExerciseProgress({})
    setDraftProgress({})
    setSelectedLessons([])
    logInfo('LessonPage', 'load lesson started', { slug, lessonId })
    setShowVideo(false)
    setVideoLoaded(false)
    fitnessApi
      .getCourses()
      .then(async (courses) => {
        if (cancelled) return
        const matchedCourse = courses.find(
          (apiCourse) => mapApiCourseToAppCourseRef(apiCourse).slug === slug,
        )
        if (!matchedCourse) {
          if (cancelled) return
          setLessonLoadError('Курс не найден в API')
          logError('LessonPage', 'course not found by slug', { slug, lessonId })
          return
        }
        const mappedCourseRef = mapApiCourseToAppCourseRef(matchedCourse)
        if (cancelled) return
        setCourseRef(mappedCourseRef)
        setCourseId(matchedCourse._id)
        const [workout, courseWorkouts] = await Promise.all([
          fitnessApi.getWorkoutById(lessonId, token),
          fitnessApi.getCourseWorkouts(matchedCourse._id, token).catch(() => []),
        ])
        if (cancelled) return
        const queueSource =
          selectedLessonIdsFromQuery.length > 0
            ? courseWorkouts.filter((item) => selectedLessonIdsFromQuery.includes(item._id))
            : [workout]
        const queue = queueSource.map((item) => ({ id: item._id, title: item.name }))
        setSelectedLessons(queue.length > 0 ? queue : [{ id: workout._id, title: workout.name }])
        const mappedItems: ExerciseItem[] = workout.exercises.map((exercise, index) => {
          const target = Math.max(1, exercise.quantity)
          return {
            id: exercise._id,
            key: (['forward', 'backward', 'knees'][index % 3] ?? 'forward') as ExerciseDef['key'],
            label: exercise.name,
            question: `Сколько раз вы сделали "${exercise.name}"? Цель: ${target}.`,
            quantity: target,
          }
        })
        setExerciseItems(mappedItems)
        setLessonTitle(workout.name)
        setLessonVideoUrl(workout.video)
        if (mappedItems.length === 0) {
          setLessonLoadError('В тренировке пока нет упражнений')
          return
        }

        try {
          const workoutProgress = await fitnessApi.getWorkoutProgress(
            matchedCourse._id,
            lessonId,
            token,
          )
          if (cancelled) return
          const progressByItem = Object.fromEntries(
            mappedItems.map((item, index) => {
              const reps = workoutProgress.progressData[index] ?? 0
              const percent = Math.min(
                100,
                Math.max(0, repsToPercent(reps, item.quantity)),
              )
              return [item.id, percent]
            }),
          ) as Record<string, number>
          setExerciseProgress(progressByItem)
        } catch {
          if (cancelled) return
          setExerciseProgress(createExerciseProgress(mappedItems, 0))
        }
        setDraftProgress(createDraftProgress(mappedItems))
        logInfo('LessonPage', 'load lesson success', {
          slug,
          lessonId,
          courseId: matchedCourse._id,
          exerciseCount: mappedItems.length,
        })
      })
      .catch((error) => {
        if (cancelled) return
        setLessonLoadError('Не удалось загрузить данные тренировки')
        logError('LessonPage', 'load lesson failed', {
          slug,
          lessonId,
          error: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => {
        if (!cancelled) setIsLessonLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug, lessonId, token, selectedLessonIdsFromQuery])

  useEffect(() => {
    if (!progressSavedModalOpen) return
    const raf = requestAnimationFrame(() => setProgressSavedModalVisible(true))
    progressSavedCloseTimerRef.current = window.setTimeout(() => {
      closeProgressSavedModal()
    }, 1600)

    return () => {
      cancelAnimationFrame(raf)
      if (progressSavedCloseTimerRef.current) {
        window.clearTimeout(progressSavedCloseTimerRef.current)
        progressSavedCloseTimerRef.current = null
      }
      if (progressSavedUnmountTimerRef.current) {
        window.clearTimeout(progressSavedUnmountTimerRef.current)
        progressSavedUnmountTimerRef.current = null
      }
    }
  }, [progressSavedModalOpen])

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

    const hasResizeObserver = typeof ResizeObserver !== 'undefined'
    const ro = hasResizeObserver ? new ResizeObserver(() => update()) : null
    if (ro) {
      ro.observe(el)
      if (el.firstElementChild) {
        ro.observe(el.firstElementChild)
      }
    }
    window.addEventListener('resize', update)

    update()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [progressModalOpen])

  const hasExistingProgress = Object.values(exerciseProgress).some((value) => value > 0)
  const desktopColumns = [0, 1, 2].map((colIndex) =>
    exerciseItems.filter((_, index) => index % 3 === colIndex),
  )
  const isProgressActionDisabled =
    isLessonLoading || isSavingProgress || exerciseItems.length === 0
  const lessonHeading = courseRef?.title ?? 'Тренировка'
  const lessonQueueParam = useMemo(
    () => selectedLessons.map((lesson) => lesson.id).join(','),
    [selectedLessons],
  )

  if (!token) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[35px] sm:pt-[49px] pb-12">
        <div className="max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px]">
          {isLessonLoading && <ProfileCoursesLoading label="Загружаем тренировку" />}
          {!isLessonLoading && lessonLoadError && (
            <p style={{ fontFamily: 'Roboto, sans-serif', color: '#dc2626' }}>
              {lessonLoadError}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            <h1
              className="text-left text-[32px] sm:text-[40px] leading-[1.1] text-black"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}
            >
              {lessonHeading}
            </h1>
          </div>
          {selectedLessons.length > 1 && (
            <section className="w-full max-w-[1160px] rounded-[20px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] p-5 flex flex-col gap-3">
              <h2
                className="text-[20px] sm:text-[24px] leading-[1.1] text-black"
                style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
              >
                Выбранные тренировки
              </h2>
              <div className="flex flex-col gap-2">
                {selectedLessons.map((lesson, index) => {
                  const to = `/course/${slug}/lesson/${lesson.id}?lessonIds=${encodeURIComponent(lessonQueueParam)}`
                  const isCurrent = lesson.id === lessonId
                  return (
                    <Link
                      key={lesson.id}
                      to={to}
                      className={`rounded-[14px] border px-4 py-3 text-[16px] leading-[1.1] transition-colors ${
                        isCurrent
                          ? 'border-[#BCEC30] bg-[#F6FFD8]'
                          : 'border-black/10 bg-white hover:bg-black/5'
                      }`}
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {`${index + 1}. ${lesson.title}`}
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-5">
            <div
              className="relative w-[343px] sm:w-full max-w-[343px] sm:max-w-[1160px] h-[189px] sm:h-auto lg:h-[639px] rounded-[9px] sm:rounded-[30px] overflow-hidden shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] bg-[#ECECEC]"
              style={{ minHeight: 189 }}
            >
              {(!showVideo || !videoLoaded) && (
                <div className="absolute inset-0 z-[5] bg-[#1E1E1E] flex items-center justify-center">
                  <p
                    className="text-[16px] text-white/80"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {isLessonLoading ? 'Загружаем видео...' : 'Нажмите, чтобы запустить видео'}
                  </p>
                </div>
              )}
              {showVideo && (
                <iframe
                  className="relative z-0 w-full h-full min-h-[189px] sm:min-h-[260px]"
                  src={lessonVideoUrl}
                  title={lessonTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  onLoad={() => setVideoLoaded(true)}
                />
              )}
              {/* Центральный знак воспроизведения: запускаем iframe по клику */}
              {!showVideo ? (
                <button
                  type="button"
                  onClick={() => {
                    if (lessonVideoUrl) setShowVideo(true)
                  }}
                  disabled={!lessonVideoUrl || isLessonLoading}
                  className="absolute inset-0 z-10 flex items-center justify-center disabled:opacity-60"
                  aria-label="Запустить видео"
                >
                  <img
                    src="/images/play.svg"
                    alt=""
                    width={46}
                    height={46}
                    className="w-[46px] h-[46px] sm:w-[156px] sm:h-[156px] object-contain"
                  />
                </button>
              ) : (
                <div
                  className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                  aria-hidden
                >
                  <img
                    src="/images/play.svg"
                    alt=""
                    width={46}
                    height={46}
                    className={`w-[46px] h-[46px] sm:w-[156px] sm:h-[156px] object-contain transition-opacity duration-200 ${
                      videoLoaded ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>
              )}
            </div>
          </section>

          <section
            className="sm:hidden w-full max-w-[343px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
            style={{ padding: 30 }}
          >
            <div className="flex flex-col w-full gap-[40px]">
              <div className="flex flex-col gap-[20px]">
                <h2
                  style={{
                    width: '100%',
                    maxWidth: 283,
                    color: 'rgba(0, 0, 0, 1)',
                    fontFamily: 'Roboto, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: 32,
                    lineHeight: '110%',
                    letterSpacing: 0,
                    textAlign: 'left',
                  }}
                >
                  {`Упражнения ${lessonTitle}`}
                </h2>

                <div className="flex flex-col gap-[24px] w-full max-w-[283px]">
                  {exerciseItems.map((item) => {
                    const progress = exerciseProgress[item.id] ?? 0
                    return (
                      <div key={item.id} className="flex flex-col gap-[10px]">
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
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {`${item.label} ${progress}%`}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            height: 6,
                            borderRadius: 50,
                            background: 'rgba(247, 247, 247, 1)',
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
              </div>

              <button
                type="button"
                onClick={openProgressModal}
                disabled={isProgressActionDisabled}
                className="w-[283px] h-[52px] flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity"
                style={{
                  padding: '16px 26px',
                  background: 'rgba(188, 236, 48, 1)',
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 18,
                  lineHeight: '110%',
                  letterSpacing: 0,
                  textAlign: 'center',
                  opacity: isProgressActionDisabled ? 0.65 : 1,
                }}
              >
                Обновить свой прогресс
              </button>
            </div>
          </section>

          <section
            className="hidden sm:block w-full rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
            style={{
              maxWidth: 1160,
              minHeight: 375,
              padding: 30,
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
                  {`Упражнения ${lessonTitle}`}
                </h2>

                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start"
                  style={{ gap: 40 }}
                >
                  {desktopColumns.map((columnItems, col) => (
                    <div
                      key={col}
                      className="flex flex-col w-full max-w-[283px] sm:max-w-[333px]"
                      style={{ gap: 20 }}
                    >
                      {columnItems.map((item) => {
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
                              className="max-w-[283px] sm:max-w-[333px]"
                              style={{
                                width: '100%',
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
                disabled={isProgressActionDisabled}
                className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity max-w-[283px] sm:max-w-[274px]"
                style={{
                  width: '100%',
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
                  opacity: isProgressActionDisabled ? 0.65 : 1,
                }}
              >
                {hasExistingProgress ? 'Обновить свой прогресс' : 'Заполнить свой прогресс'}
              </button>
            </div>
          </section>

        </div>
      </main>
      {progressModalOpen && (
        <div
          className={`fixed inset-0 z-[130] flex items-center justify-center px-4 transition-opacity duration-300 ${
            progressModalVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ background: 'rgba(0, 0, 0, 0.35)' }}
          onClick={closeProgressModal}
        >
          <div
            className={`bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] rounded-[20px] flex flex-col justify-start items-center transition-all duration-300 ease-out ${
              progressModalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'
            }`}
            style={{
              width: 'min(343px, calc(100vw - 24px))',
              height: 'min(572px, calc(100vh - 24px))',
              padding: 40,
              gap: 34,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex flex-col" style={{ flex: 1, minHeight: 0, gap: 24 }}>
              <h3
                style={{
                  width: '100%',
                  maxWidth: 263,
                  color: 'rgba(0, 0, 0, 1)',
                  fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: 32,
                  lineHeight: '110%',
                  letterSpacing: 0,
                  textAlign: 'left',
                  margin: 0,
                }}
              >
                Мой прогресс
              </h3>

              <div className="relative" style={{ flex: 1, minHeight: 0 }}>
                <div
                  ref={progressListRef}
                  className="lesson-picker-scroll-hide overflow-y-auto overflow-x-hidden"
                  style={{ height: 'calc(100% - 12px)', minHeight: 0, paddingRight: 20 }}
                >
                  <div className="flex flex-col" style={{ gap: 20 }}>
                    {exerciseItems.map((item) => (
                      <div key={item.id} className="flex flex-col" style={{ gap: 10 }}>
                        <label
                          style={{
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
                          {item.question}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="0"
                          value={draftProgress[item.id] ?? ''}
                          onChange={(e) =>
                            setDraftProgress((prev) => ({
                              ...prev,
                              [item.id]: e.target.value.replace(/[^\d]/g, ''),
                            }))
                          }
                          className="w-full rounded-[10px] border border-[#C4C4C4] bg-white px-[18px]"
                          style={{
                            height: 47,
                            color: 'rgba(0, 0, 0, 1)',
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 400,
                            fontSize: 20,
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
            </div>

            <button
              type="button"
              onClick={saveProgress}
              disabled={isSavingProgress}
              className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity disabled:opacity-60"
              style={{
                width: 263,
                height: 52,
                alignSelf: 'center',
                gap: 10,
                padding: '16px 26px',
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
              {isSavingProgress ? 'Сохраняем...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
      {progressSavedModalOpen && (
        <div
          className={`fixed inset-0 z-[140] flex items-center justify-center px-4 transition-opacity duration-200 ${
            progressSavedModalVisible
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          style={{ background: 'rgba(0, 0, 0, 0.2)' }}
          onClick={closeProgressSavedModal}
        >
          <div
            className={`w-full max-w-[343px] h-[252px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] flex flex-col justify-start items-center gap-[34px] p-[40px] transition-all duration-200 ease-out ${
              progressSavedModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: 0,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 32,
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
