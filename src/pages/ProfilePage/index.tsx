// страница профиля пользователя с его курсами
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import '@/components/CourseCard/CourseCard.css'
import {
  fitnessApi,
  type ApiCourse,
  type ApiWorkout,
  type ApiWorkoutProgress,
} from '@/api/fitness'
import { mapApiCourseToAppCourseRef } from '@/api/mappers'
import { ProfileCoursesLoading } from '@/components/Loading'
import { LessonPickerModal } from '@/components/LessonPickerModal'
import { ProfileCourseCard } from '@/components/ProfileCourseCard'
import { ProfileHeaderSection } from '@/components/ProfileHeaderSection'
import type { PickerLesson, ProfileCourse } from './types'

export function ProfilePage() {
  const navigate = useNavigate()
  // из контекста получаем информацию о пользователе и функции авторизации
  const { user, token, logout, openLoginModal, refreshMe } = useAuth()
  // здесь храним общий процент прогресса по каждому курсу (по slug)
  const [courseProgressMap, setCourseProgressMap] = useState<
    Record<string, number>
  >({})
  // список курсов, который пришёл с API
  const [apiCourses, setApiCourses] = useState<ApiCourse[]>([])
  // здесь отдельно дозакачиваем курсы по id, если их не было в общем списке
  const [coursesById, setCoursesById] = useState<Record<string, ApiCourse>>({})
  // флаг, что профиль ещё грузит курсы
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  // текст ошибки при загрузке курсов профиля
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null)
  // id курса, который сейчас удаляется из профиля
  const [removingCourseId, setRemovingCourseId] = useState<string | null>(null)
  // id курса, по которому сейчас запускается тренировка
  const [startingCourseId, setStartingCourseId] = useState<string | null>(null)
  // id курсов, которые уже удалены, чтобы не показывать их в списке
  const [removedCourseIds, setRemovedCourseIds] = useState<string[]>([])
  // сюда кладём список уроков (тренировок) для каждого курса
  const [courseWorkoutsMap, setCourseWorkoutsMap] = useState<
    Record<string, PickerLesson[]>
  >({})
  // курс, для которого сейчас открыт выбор урока
  const [lessonPickerCourse, setLessonPickerCourse] =
    useState<ProfileCourse | null>(null)
  // видна ли модалка выбора урока
  const [lessonPickerVisible, setLessonPickerVisible] = useState(false)
  // флаг загрузки уроков для модалки
  const [isLessonPickerLoading, setIsLessonPickerLoading] = useState(false)
  // текст ошибки при загрузке уроков
  const [lessonPickerLoadError, setLessonPickerLoadError] = useState<
    string | null
  >(null)
  // какие уроки пользователь выбрал в модалке
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>([])
  // таймер, чтобы чуть позже полностью очистить состояние модалки
  const lessonPickerCloseTimerRef = useRef<number | null>(null)
  // счётчик запросов к API для модалки, чтобы не путать ответы
  const lessonPickerRequestIdRef = useRef(0)
  // просто счётчик, чтобы форсировать обновление прогресса
  const [progressRefreshTrigger, setProgressRefreshTrigger] = useState(0)
  // сюда складываем slug-и курсов, по которым уже удалось получить прогресс
  const [progressLoadedSlugs, setProgressLoadedSlugs] = useState<Set<string>>(
    () => new Set()
  )

  // если пользователь долго отсутствовал (страница была неактивна),
  // то при возвращении обновляем прогресс по курсам
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
            300
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

  // если пользователь не авторизован, перенаправляем на главную и открываем модалку входа
  useEffect(() => {
    if (!user) {
      openLoginModal()
      navigate('/', { replace: true })
    }
  }, [user, openLoginModal, navigate])

  // выход из профиля
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // открытие модалки выбора урока для конкретного курса
  const openLessonPicker = async (course: ProfileCourse) => {
    if (lessonPickerCloseTimerRef.current) {
      window.clearTimeout(lessonPickerCloseTimerRef.current)
      lessonPickerCloseTimerRef.current = null
    }
    if (!token) return
    setLessonPickerCourse(course)
    setLessonPickerLoadError(null)
    setSelectedLessonIds([])
    // небольшая задержка для плавной анимации появления модалки
    requestAnimationFrame(() => setLessonPickerVisible(true))
    setIsLessonPickerLoading(true)

    let lessons = courseWorkoutsMap[course.courseId] ?? []
    let failedToLoad = false
    const requestId = ++lessonPickerRequestIdRef.current
    // если уроки ещё не загружали, запрашиваю их с API
    if (lessons.length === 0) {
      try {
        const workouts = await fitnessApi.getCourseWorkouts(
          course.courseId,
          token
        )
        if (requestId !== lessonPickerRequestIdRef.current) return
        lessons = workouts.map((item: ApiWorkout) => ({
          id: item._id,
          title: item.name,
        }))
        setCourseWorkoutsMap((prev) => ({
          ...prev,
          [course.courseId]: lessons,
        }))
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
    // по умолчанию выбираю первый урок в списке
    setSelectedLessonIds(lessons[0]?.id ? [lessons[0].id] : [])
    setIsLessonPickerLoading(false)
  }

  // сброс прогресса по курсу (когда уже 100% и хотим пройти заново)
  const resetCourseProgress = async (course: ProfileCourse) => {
    if (!token) return
    try {
      await fitnessApi.resetCourseProgress(course.courseId, token)
      setCourseProgressMap((prev) => ({ ...prev, [course.slug]: 0 }))
    } catch {
      // здесь ошибки не показываю, просто не меняю состояние
    }
  }

  // начать курс: если закончен - сбрасываем прогресс, потом открываем модалку выбора урока
  const startCourse = async (course: ProfileCourse, progress: number) => {
    if (
      startingCourseId === course.courseId ||
      removingCourseId === course.courseId
    )
      return
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

  // удалить курс из профиля
  const removeCourse = async (course: ProfileCourse) => {
    if (!token) return
    if (removingCourseId === course.courseId) return
    setRemovingCourseId(course.courseId)
    try {
      await fitnessApi.deleteCourseFromUser(course.courseId, token)
      setRemovedCourseIds((prev) => [...prev, course.courseId])
      toast.success('Курс удален из профиля')
      refreshMe()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось удалить курс'
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
    } finally {
      setRemovingCourseId(null)
    }
  }

  // если пользователь снова выбрал курс, который раньше считался удалённым,
  // убираем его из списка удалённых
  useEffect(() => {
    if (!user) return
    setRemovedCourseIds((prev) =>
      prev.filter((id) => user.selectedCourses.includes(id))
    )
  }, [user, user?.selectedCourses])

  // закрытие модалки выбора урока с небольшим таймером для анимации
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

  // начать тренировку, опираясь на выбранные в модалке уроки
  const startSelectedLesson = () => {
    if (!lessonPickerCourse || selectedLessonIds.length === 0) return
    const orderedSelection = pickerLessons
      .filter((lesson) => selectedLessonIds.includes(lesson.id))
      .map((lesson) => lesson.id)
    const selectedId = orderedSelection[0]
    const firstSelected = pickerLessons.find(
      (lesson) => lesson.id === selectedId
    )
    if (!firstSelected) return
    const lessonIdsParam = encodeURIComponent(orderedSelection.join(','))
    navigate(
      `/course/${lessonPickerCourse.slug}/lesson/${firstSelected.id}?lessonIds=${lessonIdsParam}`
    )
    closeLessonPicker()
  }

  // переключение выбранного урока в модалке
  const toggleLessonSelection = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    )
  }

  // объединяем курсы из общего списка и из точечных запросов по id
  const allKnownCourses = useMemo(
    () => [
      ...apiCourses,
      ...Object.values(coursesById).filter(
        (courseFromMap) =>
          !apiCourses.some((course) => course._id === courseFromMap._id)
      ),
    ],
    [apiCourses, coursesById]
  )

  // фактически выбранные курсы пользователя, из которых исключаем уже удалённые
  const effectiveSelectedCourses = user
    ? user.selectedCourses.filter((id) => !removedCourseIds.includes(id))
    : []

  // здесь мы собираем курсы пользователя вместе с их прогрессом
  const purchasedWithCourse = user
    ? (effectiveSelectedCourses
        .map((courseId) => {
          const normalizedCourseId = courseId.trim().toLowerCase()
          const apiCourse =
            allKnownCourses.find((item) => item._id === courseId) ??
            allKnownCourses.find(
              (item) =>
                mapApiCourseToAppCourseRef(item).slug === normalizedCourseId
            )
          if (!apiCourse) return null
          const mappedCourse = mapApiCourseToAppCourseRef(apiCourse)
          const progress = courseProgressMap[mappedCourse.slug] ?? 0
          return { course: mappedCourse, progress }
        })
        .filter(Boolean) as { course: ProfileCourse; progress: number }[])
    : []

  // уроки, которые есть у курса, выбранного в модалке
  const pickerLessons = lessonPickerCourse
    ? (courseWorkoutsMap[lessonPickerCourse.courseId] ?? [])
    : []
  // заголовок для модалки: название курса плюс приписка
  const lessonSeriesTitle = `${lessonPickerCourse?.title ?? ''} на каждый день`

  // при размонтировании страницы профиля чистим таймер модалки
  useEffect(() => {
    return () => {
      if (lessonPickerCloseTimerRef.current) {
        window.clearTimeout(lessonPickerCloseTimerRef.current)
      }
    }
  }, [])

  // первый запрос за курсами профиля
  useEffect(() => {
    setIsLoadingCourses(true)
    setProfileLoadError(null)
    fitnessApi
      .getCourses()
      .then((courses) => setApiCourses(courses))
      .catch(() => {
        setApiCourses([])
        setProfileLoadError('Не удалось загрузить курсы профиля')
      })
      .finally(() => setIsLoadingCourses(false))
  }, [])

  // если у пользователя в профиле есть id курсов, которых нет в apiCourses,
  // то дозакачиваем их по одному
  useEffect(() => {
    if (!user || user.selectedCourses.length === 0) return
    if (typeof fitnessApi.getCourseById !== 'function') return

    const knownIds = new Set([
      ...apiCourses.map((course) => course._id),
      ...Object.keys(coursesById),
    ])
    const missingIds = user.selectedCourses.filter(
      (courseId) => courseId && !knownIds.has(courseId)
    )
    if (missingIds.length === 0) return

    Promise.allSettled(
      missingIds.map((courseId) => fitnessApi.getCourseById(courseId))
    ).then((results) => {
      const loaded = results
        .filter(
          (result): result is PromiseFulfilledResult<ApiCourse> =>
            result.status === 'fulfilled'
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
    })
  }, [user, apiCourses, coursesById])

  // здесь считаем общий прогресс по каждому курсу (средний процент по всем тренировкам)
  useEffect(() => {
    const courseIds =
      user?.selectedCourses.filter((id) => !removedCourseIds.includes(id)) ?? []
    if (!user || !token) return
    if (allKnownCourses.length === 0) return
    if (courseIds.length === 0) return
    let cancelled = false
    setProgressLoadedSlugs(new Set())
    // запасной таймаут: если прогресс долго грузится, всё равно считаем, что данные пришли
    const progressLoadMaxWait = window.setTimeout(() => {
      if (cancelled) return
      const timeoutSlugs = courseIds
        .map((id) => {
          const apiCourse = allKnownCourses.find((c) => c._id === id)
          return apiCourse ? mapApiCourseToAppCourseRef(apiCourse).slug : null
        })
        .filter((s): s is string => s != null)
      setProgressLoadedSlugs((prev) => new Set([...prev, ...timeoutSlugs]))
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
          const workoutsById = new Map(
            workoutsList.map((workout) => [workout._id, workout])
          )
          let workoutsProgress =
            progress && Array.isArray(progress.workoutsProgress)
              ? progress.workoutsProgress
              : []

          // если не пришёл сводный прогресс по всем тренировкам,
          // пробуем отдельно запросить прогресс по каждой тренировке
          if (workoutsProgress.length === 0 && workoutsList.length > 0) {
            const fallbackProgress = await Promise.all(
              workoutsList.map((workout) =>
                fitnessApi
                  .getWorkoutProgress(courseId, workout._id, token)
                  .catch(() => null)
              )
            )
            workoutsProgress = fallbackProgress.filter(
              (item): item is NonNullable<typeof item> => item !== null
            )
          }

          const progressByWorkoutId = new Map(
            workoutsProgress.map((wp) => [wp.workoutId, wp])
          )

          // вспомогательная функция: считает процент по одной тренировке
          function getWorkoutPercent(
            workout: { _id: string; exercises?: { quantity?: number }[] },
            workoutProgress: ApiWorkoutProgress | undefined
          ): number {
            if (!workoutProgress) return 0
            if (workoutProgress.workoutCompleted) return 100
            const progressData = Array.isArray(workoutProgress.progressData)
              ? workoutProgress.progressData
              : []
            // если нет списка упражнений, то просто проверяем, было ли хоть какое-то движение
            if (
              !Array.isArray(workout.exercises) ||
              workout.exercises.length === 0
            ) {
              const hasAnyProgress = progressData.some(
                (value) => Number(value) > 0
              )
              return hasAnyProgress ? 1 : 0
            }
            const exercisePercents = workout.exercises.map(
              (exercise, index) => {
                const reps = Number(progressData[index] ?? 0)
                const target = Math.max(1, exercise?.quantity ?? 1)
                const percent = Math.round((reps / target) * 100)
                return Math.min(100, Math.max(0, percent))
              }
            )
            if (exercisePercents.length === 0) return 0
            return Math.round(
              exercisePercents.reduce((sum, value) => sum + value, 0) /
                exercisePercents.length
            )
          }

          // список id тренировок, которые входят в курс
          const allWorkoutIds = Array.isArray(apiCourse.workouts)
            ? apiCourse.workouts
            : workoutsList.map((w) => w._id)
          const values = allWorkoutIds.map((workoutId) => {
            const workout = workoutsById.get(workoutId) ?? {
              _id: workoutId,
              exercises: [] as { quantity?: number }[],
            }
            return getWorkoutPercent(
              workout,
              progressByWorkoutId.get(workoutId)
            )
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
          // если сервер говорит, что курс не добавлен или не найден,
          // то просто считаем прогресс по нему равным 0
          if (
            msg.includes('не был добавлен') ||
            msg.includes('не был добавлен этот курс')
          ) {
            return [mapped.slug, 0] as const
          }
          if (
            msg.includes('404') ||
            msg.includes('Not Found') ||
            msg.includes('не найден')
          ) {
            return [mapped.slug, 0] as const
          }
          return [mapped.slug, 0] as const
        }
      })
    )
      .then((pairs) => {
        if (cancelled) return
        const next = pairs.filter(Boolean) as ReadonlyArray<
          readonly [string, number]
        >
        if (next.length > 0) {
          const slugs = next.map(([slug]) => slug)
          setCourseProgressMap((prev) => ({
            ...prev,
            ...Object.fromEntries(next),
          }))
          setProgressLoadedSlugs((prev) => new Set([...prev, ...slugs]))
        }
      })
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(progressLoadMaxWait)
      })
    return () => {
      cancelled = true
      window.clearTimeout(progressLoadMaxWait)
    }
  }, [user, token, allKnownCourses, removedCourseIds, progressRefreshTrigger])

  if (!user) return null

  return (
    <div id="top" className="min-h-screen bg-[#FAFAFA] font-sans text-black">
      <Header />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[50px] sm:pt-[95px] pb-0 sm:pb-12">
        <div className="flex flex-col gap-[24px] sm:gap-[60px] max-w-[1160px]">
          {/* шапка профиля с именем пользователя и кнопкой выхода */}
          <ProfileHeaderSection user={user} onLogout={handleLogout} />

          <section className="flex flex-col gap-[40px]">
            <h2
              className="text-left font-normal text-[24px] sm:text-[40px] leading-[1.1] text-black max-w-[810px]"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Мои курсы
            </h2>
            <div className="flex flex-row flex-wrap gap-6 sm:gap-[40px] overflow-visible">
              {/* пока список курсов профиля грузится, показываю лоадер */}
              {isLoadingCourses && <ProfileCoursesLoading />}
              {/* если была ошибка при загрузке курсов профиля */}
              {!isLoadingCourses && profileLoadError && (
                <p
                  style={{ fontFamily: 'Roboto, sans-serif', color: '#dc2626' }}
                >
                  {profileLoadError}
                </p>
              )}
              {/* сами карточки курсов профиля с прогрессом */}
              {purchasedWithCourse.map(({ course, progress }) => (
                <ProfileCourseCard
                  key={course.slug}
                  course={course}
                  progress={progress}
                  progressLoading={!progressLoadedSlugs.has(course.slug)}
                  onRemove={() => removeCourse(course)}
                  isRemoving={removingCourseId === course.courseId}
                  removeDisabled={
                    removingCourseId === course.courseId ||
                    startingCourseId === course.courseId
                  }
                  onStart={() => startCourse(course, progress)}
                  startDisabled={
                    removingCourseId === course.courseId ||
                    startingCourseId === course.courseId
                  }
                  startLoading={startingCourseId === course.courseId}
                />
              ))}
              {/* если курсов ещё нет, честно это показываю */}
              {!isLoadingCourses &&
                !profileLoadError &&
                purchasedWithCourse.length === 0 && (
                  <p style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Курсы пока не добавлены.
                  </p>
                )}
            </div>
          </section>
        </div>
      </main>
      {/* футер с кнопкой "наверх" */}
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[24px] sm:pt-0 pb-12 sm:pb-16">
        <div className="w-full max-w-[343px] sm:max-w-none mx-auto flex justify-end sm:justify-center">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="flex flex-row justify-center items-center rounded-[46px] sm:hover:opacity-90 transition-all duration-300 ease-out sm:hover:scale-[1.03] shrink-0"
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
      {/* модальное окно выбора урока для старта тренировки */}
      {lessonPickerCourse && (
        <LessonPickerModal
          visible={lessonPickerVisible}
          onClose={closeLessonPicker}
          lessons={pickerLessons}
          selectedLessonIds={selectedLessonIds}
          onToggleLesson={toggleLessonSelection}
          onStart={startSelectedLesson}
          isLoading={isLessonPickerLoading}
          errorMessage={lessonPickerLoadError}
          onRetry={() => void openLessonPicker(lessonPickerCourse)}
          lessonSeriesTitle={lessonSeriesTitle}
        />
      )}
    </div>
  )
}
