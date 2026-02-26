import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi, type ApiCourse, type ApiWorkout, type ApiWorkoutProgress } from '@/api/fitness'
import { mapApiCourseToAppCourseRef, type AppCourseRef } from '@/api/mappers'
import { logError, logInfo } from '@/utils/logger'
import { ProfileCoursesLoading } from '@/components/Loading'

type ProfileCourse = AppCourseRef
type PickerLesson = { id: string; title: string }

function ProfileCourseCard({
  course,
  progress,
  progressLoading = false,
  onRemove,
  removeDisabled = false,
  isRemoving = false,
  onStart,
  startDisabled = false,
  startLoading = false,
}: {
  course: ProfileCourse
  progress: number
  progressLoading?: boolean
  onRemove?: () => void
  removeDisabled?: boolean
  isRemoving?: boolean
  onStart?: () => Promise<void> | void
  startDisabled?: boolean
  startLoading?: boolean
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
      className={`relative w-[343px] sm:w-[360px] min-h-[649px] shrink-0 group overflow-visible card-hover-group transition-opacity duration-300 ${
        isRemoving ? 'opacity-80' : 'opacity-100'
      }`}
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
          disabled={removeDisabled}
          className="absolute rounded-full flex items-center justify-center sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-110 shrink-0"
          style={{
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            background: 'transparent',
            cursor: "url('/images/cursor.svg') 0 0, auto",
            opacity: removeDisabled ? 0.6 : 1,
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
          <p className="text-[18px] leading-[1.1] text-black text-left flex items-center gap-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Прогресс{' '}
            {progressLoading ? (
              <span className="relative inline-block w-[18px] h-[18px] shrink-0" aria-hidden>
                <span className="absolute inset-0 rounded-full border-2 border-[#D9D9D9] border-t-[#00C1FF] border-r-[#00C1FF] animate-spin" />
              </span>
            ) : (
              `${progress}%`
            )}
          </p>
          <div className="h-[6px] w-full max-w-[300px] rounded-[50px] bg-[#D9D9D9] overflow-hidden">
            {progressLoading ? (
              <div className="profile-progress-loading-bar h-full rounded-[50px]" />
            ) : (
              <div
                className="h-full rounded-[50px] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: 'rgba(0, 193, 255, 1)',
                }}
              />
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onStart?.()}
          disabled={startDisabled}
          className="w-full max-w-[300px] flex justify-center items-center rounded-[46px] text-[18px] leading-[1.1] text-black font-normal sm:hover:opacity-90 sm:transition-transform sm:duration-300 sm:ease-out sm:hover:scale-[1.03]"
          style={{
            backgroundColor: '#BCEC30',
            fontFamily: 'Roboto, sans-serif',
            padding: '16px 26px',
            opacity: startDisabled ? 0.65 : 1,
          }}
        >
          {startLoading ? 'Загружаем...' : progressLabel}
        </button>
      </div>
      </article>
      {isRemoving && (
        <div className="absolute inset-0 z-[40] rounded-[30px] bg-black/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="relative w-9 h-9" aria-hidden>
            <span className="absolute inset-0 rounded-full border-[3px] border-white/40" />
            <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-white border-r-white animate-spin" />
          </div>
        </div>
      )}
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
  const { user, token, logout, openLoginModal, refreshMe } = useAuth()
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({})
  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([])
  const [coursesById, setCoursesById] = useState<Record<string, ApiCourse>>({})
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null)
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null)
  const [startingCourseId, setStartingCourseId] = useState<string | null>(null)
  const [removedCourseIds, setRemovedCourseIds] = useState<string[]>([])
  const [courseWorkoutsMap, setCourseWorkoutsMap] = useState<Record<string, PickerLesson[]>>({})
  const [lessonPickerCourse, setLessonPickerCourse] = useState<ProfileCourse | null>(null)
  const [lessonPickerVisible, setLessonPickerVisible] = useState(false)
  const [isLessonPickerLoading, setIsLessonPickerLoading] = useState(false)
  const [lessonPickerLoadError, setLessonPickerLoadError] = useState<string | null>(null)
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  const lessonListRef = useRef<HTMLDivElement>(null)
  const lessonPickerCloseTimerRef = useRef<number | null>(null)
  const lessonPickerRequestIdRef = useRef(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(116)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [progressRefreshTrigger, setProgressRefreshTrigger] = useState(0)
  const [isProgressLoading, setIsProgressLoading] = useState(false)

  useEffect(() => {
    let hiddenAt: number | null = null
    let timeoutId: number | null = null
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else {
        if (hiddenAt != null && Date.now() - hiddenAt > 1500) {
          timeoutId = window.setTimeout(
            () => setProgressRefreshTrigger((k) => k + 1),
            300,
          )
        }
        hiddenAt = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      if (timeoutId != null) window.clearTimeout(timeoutId)
    }
  }, [])

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

  const openLessonPicker = async (course: ProfileCourse) => {
    if (lessonPickerCloseTimerRef.current) {
      window.clearTimeout(lessonPickerCloseTimerRef.current)
      lessonPickerCloseTimerRef.current = null
    }
    if (!token) return
    setLessonPickerCourse(course)
    setLessonPickerLoadError(null)
    setSelectedLessonIds([])
    setHasOverflow(false)
    requestAnimationFrame(() => setLessonPickerVisible(true))
    setIsLessonPickerLoading(true)

    let lessons = courseWorkoutsMap[course.courseId] ?? []
    let failedToLoad = false
    const requestId = ++lessonPickerRequestIdRef.current
    if (lessons.length === 0) {
      try {
        const workouts = await fitnessApi.getCourseWorkouts(course.courseId, token)
        if (requestId !== lessonPickerRequestIdRef.current) return
        lessons = workouts.map((item: ApiWorkout) => ({ id: item._id, title: item.name }))
        setCourseWorkoutsMap((prev) => ({ ...prev, [course.courseId]: lessons }))
      } catch {
        if (requestId !== lessonPickerRequestIdRef.current) return
        lessons = []
        failedToLoad = true
        setLessonPickerLoadError('Не удалось загрузить список уроков')
      }
    }
    if (requestId !== lessonPickerRequestIdRef.current) return
    if (lessons.length === 0 && !failedToLoad) {
      setLessonPickerLoadError('Для курса пока нет доступных уроков')
    }
    setSelectedLessonIds(lessons[0]?.id ? [lessons[0].id] : [])
    setIsLessonPickerLoading(false)
  }

  const resetCourseProgress = async (course: ProfileCourse) => {
    if (!token) return
    try {
      await fitnessApi.resetCourseProgress(course.courseId, token)
      setCourseProgressMap((prev) => ({ ...prev, [course.slug]: 0 }))
      logInfo('ProfilePage', 'reset course progress success', { courseId: course.courseId })
    } catch {
      logError('ProfilePage', 'reset course progress failed', { courseId: course.courseId })
    }
  }

  const startCourse = async (course: ProfileCourse, progress: number) => {
    if (startingCourseId === course.courseId || removingCourseId === course.courseId) return
    setStartingCourseId(course.courseId)
    try {
      if (progress >= 100) {
        await resetCourseProgress(course)
      }
      await openLessonPicker(course)
    } finally {
      setStartingCourseId(null)
    }
  }

  const removeCourse = async (course: ProfileCourse) => {
    if (!token) return
    if (removingCourseId === course.courseId) return
    setRemovingCourseId(course.courseId)
    try {
      await fitnessApi.deleteCourseFromUser(course.courseId, token)
      setRemovedCourseIds((prev) => [...prev, course.courseId])
      toast.success('Курс удален из профиля')
      logInfo('ProfilePage', 'remove course success', { courseId: course.courseId })
      refreshMe()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось удалить курс'
      if (
        message.toLowerCase().includes('не был добавлен') ||
        message.toLowerCase().includes('уже удал')
      ) {
        setRemovedCourseIds((prev) => [...prev, course.courseId])
        refreshMe()
        toast('Курс уже отсутствует в профиле')
      } else {
        toast.error(message)
      }
      logError('ProfilePage', 'remove course failed', {
        courseId: course.courseId,
        message,
      })
    } finally {
      setRemovingCourseId(null)
    }
  }

  useEffect(() => {
    if (!user) return
    setRemovedCourseIds((prev) => prev.filter((id) => user.selectedCourses.includes(id)))
  }, [user?.selectedCourses])

  const closeLessonPicker = () => {
    setLessonPickerVisible(false)
    setIsLessonPickerLoading(false)
    setLessonPickerLoadError(null)
    lessonPickerRequestIdRef.current += 1
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
    const orderedSelection = pickerLessons
      .filter((lesson) => selectedLessonIds.includes(lesson.id))
      .map((lesson) => lesson.id)
    const selectedId = orderedSelection[0]
    const firstSelected = pickerLessons.find((lesson) => lesson.id === selectedId)
    if (!firstSelected) return
    const lessonIdsParam = encodeURIComponent(orderedSelection.join(','))
    navigate(
      `/course/${lessonPickerCourse.slug}/lesson/${firstSelected.id}?lessonIds=${lessonIdsParam}`,
    )
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

  const allKnownCourses = useMemo(
    () => [
      ...apiCourses,
      ...Object.values(coursesById).filter(
        (courseFromMap) => !apiCourses.some((course) => course._id === courseFromMap._id),
      ),
    ],
    [apiCourses, coursesById],
  )

  const effectiveSelectedCourses = user
    ? user.selectedCourses.filter((id) => !removedCourseIds.includes(id))
    : []

  const purchasedWithCourse = user
    ? effectiveSelectedCourses
        .map((courseId) => {
          const normalizedCourseId = courseId.trim().toLowerCase()
          const apiCourse =
            allKnownCourses.find((item) => item._id === courseId) ??
            allKnownCourses.find(
              (item) => mapApiCourseToAppCourseRef(item).slug === normalizedCourseId,
            )
          if (!apiCourse) return null
          const mappedCourse = mapApiCourseToAppCourseRef(apiCourse)
          const progress = courseProgressMap[mappedCourse.slug] ?? 0
          return { course: mappedCourse, progress }
        })
        .filter(Boolean) as { course: ProfileCourse; progress: number }[]
    : []
  const pickerLessons = lessonPickerCourse
    ? courseWorkoutsMap[lessonPickerCourse.courseId] ?? []
    : []
  const lessonSeriesTitle = `${lessonPickerCourse?.title ?? ''} на каждый день`

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
    setIsLoadingCourses(true)
    setProfileLoadError(null)
    logInfo('ProfilePage', 'load profile courses started')
    fitnessApi
      .getCourses()
      .then((courses) => {
        setApiCourses(courses)
        logInfo('ProfilePage', 'load profile courses success', { count: courses.length })
      })
      .catch((error) => {
        setApiCourses([])
        setProfileLoadError('Не удалось загрузить курсы профиля')
        logError('ProfilePage', 'load profile courses failed', {
          error: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => setIsLoadingCourses(false))
  }, [])

  useEffect(() => {
    if (!user || user.selectedCourses.length === 0) return
    if (typeof fitnessApi.getCourseById !== 'function') return

    const knownIds = new Set([
      ...apiCourses.map((course) => course._id),
      ...Object.keys(coursesById),
    ])
    const missingIds = user.selectedCourses.filter(
      (courseId) => courseId && !knownIds.has(courseId),
    )
    if (missingIds.length === 0) return

    Promise.allSettled(missingIds.map((courseId) => fitnessApi.getCourseById(courseId))).then(
      (results) => {
        const loaded = results
          .filter(
            (result): result is PromiseFulfilledResult<ApiCourse> =>
              result.status === 'fulfilled',
          )
          .map((result) => result.value)
        if (loaded.length === 0) return

        setCoursesById((prev) => {
          const next = { ...prev }
          loaded.forEach((course) => {
            next[course._id] = course
          })
          return next
        })
      },
    )
  }, [user, apiCourses, coursesById])

  useEffect(() => {
    const courseIds = user?.selectedCourses.filter((id) => !removedCourseIds.includes(id)) ?? []
    if (!user || !token || allKnownCourses.length === 0 || courseIds.length === 0) return
    let cancelled = false
    setIsProgressLoading(true)
    const progressLoadMaxWait = window.setTimeout(() => {
      if (!cancelled) setIsProgressLoading(false)
    }, 60000)
    Promise.all(
      courseIds.map(async (courseId) => {
        const apiCourse = allKnownCourses.find((item) => item._id === courseId)
        if (!apiCourse) return null
        const mapped = mapApiCourseToAppCourseRef(apiCourse)
        try {
          const [progress, workouts] = await Promise.all([
            fitnessApi.getCourseProgress(courseId, token),
            fitnessApi.getCourseWorkouts(courseId, token),
          ])

          const workoutsList = Array.isArray(workouts) ? workouts : []
          const workoutsById = new Map(workoutsList.map((workout) => [workout._id, workout]))
          let workoutsProgress = progress && Array.isArray(progress.workoutsProgress)
            ? progress.workoutsProgress
            : []

          if (workoutsProgress.length === 0 && workoutsList.length > 0) {
            const fallbackProgress = await Promise.all(
              workoutsList.map((workout) =>
                fitnessApi
                  .getWorkoutProgress(courseId, workout._id, token)
                  .catch(() => null),
              ),
            )
            workoutsProgress = fallbackProgress.filter(
              (item): item is NonNullable<typeof item> => item !== null,
            )
          }

          const progressByWorkoutId = new Map(
            workoutsProgress.map((wp) => [wp.workoutId, wp]),
          )

          function getWorkoutPercent(workout: { _id: string; exercises?: { quantity?: number }[] }, workoutProgress: ApiWorkoutProgress | undefined): number {
            if (!workoutProgress) return 0
            if (workoutProgress.workoutCompleted) return 100
            const progressData = Array.isArray(workoutProgress.progressData)
              ? workoutProgress.progressData
              : []
            if (!Array.isArray(workout.exercises) || workout.exercises.length === 0) {
              const hasAnyProgress = progressData.some((value) => Number(value) > 0)
              return hasAnyProgress ? 1 : 0
            }
            const exercisePercents = workout.exercises.map((exercise, index) => {
              const reps = Number(progressData[index] ?? 0)
              const target = Math.max(1, exercise?.quantity ?? 1)
              const percent = Math.round((reps / target) * 100)
              return Math.min(100, Math.max(0, percent))
            })
            if (exercisePercents.length === 0) return 0
            return Math.round(
              exercisePercents.reduce((sum, value) => sum + value, 0) /
                exercisePercents.length,
            )
          }

          const allWorkoutIds = Array.isArray(apiCourse.workouts) ? apiCourse.workouts : workoutsList.map((w) => w._id)
          const values = allWorkoutIds.map((workoutId) => {
            const workout = workoutsById.get(workoutId) ?? { _id: workoutId, exercises: [] as { quantity?: number }[] }
            return getWorkoutPercent(workout, progressByWorkoutId.get(workoutId))
          })
          const rawAvg =
            values.length > 0
              ? Math.round(values.reduce((s, v) => s + v, 0) / values.length)
              : 0
          const hasAnyCourseProgress = values.some((value) => value > 0)
          const avg = hasAnyCourseProgress ? Math.max(1, rawAvg) : 0
          return [mapped.slug, avg] as const
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('не был добавлен') || msg.includes('не был добавлен этот курс')) {
            return [mapped.slug, 0] as const
          }
          if (msg.includes('404') || msg.includes('Not Found') || msg.includes('не найден')) {
            return [mapped.slug, 0] as const
          }
          logError('ProfilePage', 'load course progress failed', { courseId, error: msg })
          return [mapped.slug, 0] as const
        }
      }),
    )
      .then((pairs) => {
        if (cancelled) return
        const next = pairs.filter(Boolean) as ReadonlyArray<readonly [string, number]>
        if (next.length > 0) {
          setCourseProgressMap((prev) => ({ ...prev, ...Object.fromEntries(next) }))
        }
      })
      .catch((err) => {
        if (!cancelled) logError('ProfilePage', 'load course progress failed', { error: err instanceof Error ? err.message : String(err) })
      })
      .finally(() => {
        window.clearTimeout(progressLoadMaxWait)
        setIsProgressLoading(false)
      })
    return () => {
      cancelled = true
      window.clearTimeout(progressLoadMaxWait)
      setIsProgressLoading(false)
    }
  }, [user, token, allKnownCourses, removedCourseIds, progressRefreshTrigger])

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
              {isLoadingCourses && <ProfileCoursesLoading />}
              {!isLoadingCourses && profileLoadError && (
                <p style={{ fontFamily: 'Roboto, sans-serif', color: '#dc2626' }}>
                  {profileLoadError}
                </p>
              )}
              {purchasedWithCourse.map(({ course, progress }) => (
                <ProfileCourseCard
                  key={course.slug}
                  course={course}
                  progress={progress}
                  progressLoading={isProgressLoading}
                  onRemove={() => removeCourse(course)}
                  isRemoving={removingCourseId === course.courseId}
                  removeDisabled={
                    removingCourseId === course.courseId || startingCourseId === course.courseId
                  }
                  onStart={() => startCourse(course, progress)}
                  startDisabled={
                    removingCourseId === course.courseId || startingCourseId === course.courseId
                  }
                  startLoading={startingCourseId === course.courseId}
                />
              ))}
              {!isLoadingCourses && !profileLoadError && purchasedWithCourse.length === 0 && (
                <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Курсы пока не добавлены.
                </p>
              )}
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
              className="text-[32px]"
              style={{
                width: '100%',
                maxWidth: 303,
                minHeight: 35,
                margin: 0,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'StratosSkyeng, Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
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
                {isLessonPickerLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <ProfileCoursesLoading label="Загружаем список уроков" />
                  </div>
                )}
                {!isLessonPickerLoading && lessonPickerLoadError && (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
                    <p
                      className="text-[16px] leading-[1.2] text-[#202020]"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      {lessonPickerLoadError}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (lessonPickerCourse) void openLessonPicker(lessonPickerCourse)
                      }}
                      className="rounded-[46px] bg-[#BCEC30] text-[16px] leading-[1.1] text-black hover:opacity-90 transition-opacity"
                      style={{
                        minWidth: 180,
                        height: 44,
                        fontFamily: 'Roboto, sans-serif',
                      }}
                    >
                      Повторить
                    </button>
                  </div>
                )}
                {!isLessonPickerLoading &&
                  !lessonPickerLoadError &&
                  pickerLessons.map((lesson, index) => (
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
                disabled={isLessonPickerLoading || selectedLessonIds.length === 0}
              >
                {isLessonPickerLoading ? 'Загружаем...' : 'Начать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
