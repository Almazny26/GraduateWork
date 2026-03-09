import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { ProfileCoursesLoading } from '@/components/Loading'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi } from '@/api/fitness'
import { mapApiCourseToAppCourseRef, type AppCourseRef } from '@/api/mappers'
import { percentToReps, repsToPercent } from '@/utils/progress'
import type {
  ExerciseDef,
  ExerciseItem,
  SelectedLessonItem,
} from './types'
import { ExercisesListDesktop, ExercisesListMobile } from '@/components/ExercisesList'
import { ProgressModal } from '@/components/ProgressModal'
import { ProgressSavedModal } from '@/components/ProgressSavedModal'
import { SelectedLessonsList } from '@/components/SelectedLessonsList'
import { VideoBlock } from '@/components/VideoBlock'

function createExerciseProgress(
  items: ExerciseItem[],
  value: number
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
  const [progressSavedModalVisible, setProgressSavedModalVisible] =
    useState(false)
  const [isLessonLoading, setIsLessonLoading] = useState(true)
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null)
  const [exerciseProgress, setExerciseProgress] = useState<
    Record<string, number>
  >({})
  const [draftProgress, setDraftProgress] = useState<Record<string, string>>({})
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [selectedLessons, setSelectedLessons] = useState<SelectedLessonItem[]>(
    []
  )
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
    if (isLessonLoading || exerciseItems.length === 0 || isSavingProgress)
      return
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
        })
      )
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
      ])
    ) as Record<string, number>
    setExerciseProgress(nextExerciseProgress)
    setIsSavingProgress(true)
    let saveSucceeded = false

    try {
      if (courseId && lessonId && token) {
        await fitnessApi.saveWorkoutProgress(
          courseId,
          lessonId,
          progressData,
          token
        )
        saveSucceeded = true
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)
      toast.error(
        message ||
          'Не удалось сохранить прогресс. Проверьте интернет и попробуйте снова.'
      )
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
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth
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
    setShowVideo(false)
    setVideoLoaded(false)
    fitnessApi
      .getCourses()
      .then(async (courses) => {
        if (cancelled) return
        const matchedCourse = courses.find(
          (apiCourse) => mapApiCourseToAppCourseRef(apiCourse).slug === slug
        )
        if (!matchedCourse) {
          if (cancelled) return
          setLessonLoadError('Курс не найден в API')
          return
        }
        const mappedCourseRef = mapApiCourseToAppCourseRef(matchedCourse)
        if (cancelled) return
        setCourseRef(mappedCourseRef)
        setCourseId(matchedCourse._id)
        const [workout, courseWorkouts] = await Promise.all([
          fitnessApi.getWorkoutById(lessonId, token),
          fitnessApi
            .getCourseWorkouts(matchedCourse._id, token)
            .catch(() => []),
        ])
        if (cancelled) return
        const queueSource =
          selectedLessonIdsFromQuery.length > 0
            ? courseWorkouts.filter((item) =>
                selectedLessonIdsFromQuery.includes(item._id)
              )
            : [workout]
        const queue = queueSource.map((item) => ({
          id: item._id,
          title: item.name,
        }))
        setSelectedLessons(
          queue.length > 0 ? queue : [{ id: workout._id, title: workout.name }]
        )
        const mappedItems: ExerciseItem[] = workout.exercises.map(
          (exercise, index) => {
            const target = Math.max(1, exercise.quantity)
            return {
              id: exercise._id,
              key: (['forward', 'backward', 'knees'][index % 3] ??
                'forward') as ExerciseDef['key'],
              label: exercise.name,
              question: `Сколько раз вы сделали "${exercise.name}"? Цель: ${target}.`,
              quantity: target,
            }
          }
        )
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
            token
          )
          if (cancelled) return
          const progressByItem = Object.fromEntries(
            mappedItems.map((item, index) => {
              const reps = workoutProgress.progressData[index] ?? 0
              const percent = Math.min(
                100,
                Math.max(0, repsToPercent(reps, item.quantity))
              )
              return [item.id, percent]
            })
          ) as Record<string, number>
          setExerciseProgress(progressByItem)
        } catch {
          if (cancelled) return
          setExerciseProgress(createExerciseProgress(mappedItems, 0))
        }
        setDraftProgress(createDraftProgress(mappedItems))
      })
      .catch(() => {
        if (cancelled) return
        setLessonLoadError('Не удалось загрузить данные тренировки')
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

  const hasExistingProgress = Object.values(exerciseProgress).some(
    (value) => value > 0
  )
  const isProgressActionDisabled =
    isLessonLoading || isSavingProgress || exerciseItems.length === 0
  const lessonHeading = courseRef?.title ?? 'Тренировка'
  const lessonQueueParam = useMemo(
    () => selectedLessons.map((lesson) => lesson.id).join(','),
    [selectedLessons]
  )

  if (!token) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[35px] sm:pt-[49px] pb-12">
        <div className="max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px]">
          {isLessonLoading && (
            <ProfileCoursesLoading label="Загружаем тренировку" />
          )}
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
          <SelectedLessonsList
            slug={slug}
            lessonId={lessonId}
            selectedLessons={selectedLessons}
            lessonQueueParam={lessonQueueParam}
          />

          <VideoBlock
            lessonVideoUrl={lessonVideoUrl}
            lessonTitle={lessonTitle}
            showVideo={showVideo}
            onShowVideo={() => setShowVideo(true)}
            videoLoaded={videoLoaded}
            onVideoLoaded={() => setVideoLoaded(true)}
            isLessonLoading={isLessonLoading}
          />

          <ExercisesListMobile
            lessonTitle={lessonTitle}
            exerciseItems={exerciseItems}
            exerciseProgress={exerciseProgress}
            onOpenProgressModal={openProgressModal}
            disabled={isProgressActionDisabled}
            hasExistingProgress={hasExistingProgress}
          />
          <ExercisesListDesktop
            lessonTitle={lessonTitle}
            exerciseItems={exerciseItems}
            exerciseProgress={exerciseProgress}
            onOpenProgressModal={openProgressModal}
            disabled={isProgressActionDisabled}
            hasExistingProgress={hasExistingProgress}
          />
        </div>
      </main>
      <ProgressModal
        open={progressModalOpen}
        visible={progressModalVisible}
        exerciseItems={exerciseItems}
        draftProgress={draftProgress}
        onDraftChange={setDraftProgress}
        onSave={saveProgress}
        onClose={closeProgressModal}
        isSaving={isSavingProgress}
      />
      <ProgressSavedModal
        open={progressSavedModalOpen}
        visible={progressSavedModalVisible}
        onClose={closeProgressSavedModal}
      />
    </div>
  )
}
