// страница одной тренировки (урока) с видео и упражнениями
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

// создаём объект прогресса по упражнениям, где у каждого упражнения одинаковый процент
function createExerciseProgress(
  items: ExerciseItem[],
  value: number
): Record<string, number> {
  return Object.fromEntries(items.map((item) => [item.id, value]))
}

// создаём "черновик" прогресса по упражнениям, чтобы туда писать ввод пользователя
function createDraftProgress(items: ExerciseItem[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.id, '']))
}

export function LessonPage() {
  // из адресной строки берём slug курса и id урока
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const location = useLocation()
  const { token, openLoginModal } = useAuth()

  // краткая информация о курсе, к которому относится урок
  const [courseRef, setCourseRef] = useState<AppCourseRef | null>(null)
  // id курса в базе API
  const [courseId, setCourseId] = useState<string | null>(null)
  // заголовок урока
  const [lessonTitle, setLessonTitle] = useState('')
  // ссылка на видео тренировки
  const [lessonVideoUrl, setLessonVideoUrl] = useState('')
  // список упражнений в этом уроке
  const [exerciseItems, setExerciseItems] = useState<ExerciseItem[]>([])
  // флаг, что видео успело загрузиться
  const [videoLoaded, setVideoLoaded] = useState(false)
  // показывается ли сейчас видео-блок
  const [showVideo, setShowVideo] = useState(false)
  // состояние модалки для ввода прогресса по упражнениям
  const [progressModalOpen, setProgressModalOpen] = useState(false)
  const [progressModalVisible, setProgressModalVisible] = useState(false)
  // модалка, которая показывает, что прогресс успешно сохранён
  const [progressSavedModalOpen, setProgressSavedModalOpen] = useState(false)
  const [progressSavedModalVisible, setProgressSavedModalVisible] =
    useState(false)
  // флаг загрузки данных урока
  const [isLessonLoading, setIsLessonLoading] = useState(true)
  // текст ошибки, если урок не получилось загрузить
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null)
  // здесь лежит процент выполнения по каждому упражнению (0-100)
  const [exerciseProgress, setExerciseProgress] = useState<
    Record<string, number>
  >({})
  // а здесь - те значения, которые пользователь вводит в модалке (количество повторений)
  const [draftProgress, setDraftProgress] = useState<Record<string, string>>({})
  // флаг, что сейчас отправляем прогресс на сервер
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  // список уроков, которые входят в "очередь" этой тренировки (можно пройти серию)
  const [selectedLessons, setSelectedLessons] = useState<SelectedLessonItem[]>(
    []
  )
  const progressSavedCloseTimerRef = useRef<number | null>(null)
  const progressSavedUnmountTimerRef = useRef<number | null>(null)
  const progressModalUnmountTimerRef = useRef<number | null>(null)
  // здесь разбираем query-параметр lessonIds из адресной строки, чтобы знать, какая серия уроков выбрана
  const selectedLessonIdsFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const raw = params.get('lessonIds') ?? ''
    if (!raw) return []
    return raw
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  }, [location.search])

  // открытие модалки ввода прогресса
  const openProgressModal = () => {
    if (isLessonLoading || exerciseItems.length === 0 || isSavingProgress)
      return
    if (progressModalUnmountTimerRef.current) {
      window.clearTimeout(progressModalUnmountTimerRef.current)
      progressModalUnmountTimerRef.current = null
    }
    // перед открытием модалки заполняем черновик текущим прогрессом,
    // чтобы пользователь видел, что уже сделано
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

  // закрытие модалки прогресса с небольшой задержкой для анимации
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

  // сохранение прогресса по упражнениям и отправка на сервер
  const saveProgress = async () => {
    if (isSavingProgress) return
    // небольшая функция, которая вытаскивает из строки только цифры
    const normalizeReps = (value: string) => {
      const digits = value.replace(/[^\d]/g, '')
      if (!digits) return 0
      const num = Number(digits)
      if (!Number.isFinite(num)) return 0
      return Math.max(0, num)
    }
    // превращаем введённые повторы в массив чисел, обрезая лишнее до максимума
    const progressData = exerciseItems.map((item) => {
      const reps = normalizeReps(draftProgress[item.id] ?? '')
      const target = Math.max(1, item.quantity)
      return Math.min(reps, target)
    })
    // считаем процент выполнения по каждому упражнению на фронтенде
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

    // если всё сохранилось - закрываем первую модалку и открываем вторую "успешно сохранено"
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

  // закрытие модалки "прогресс сохранён" с таймером
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

  // если токена нет, открываем окно логина
  useEffect(() => {
    if (!token) openLoginModal()
  }, [token, openLoginModal])

  // этот эффект отключает прокрутку страницы, когда открыта любая из модалок,
  // и учитывает ширину скроллбара, чтобы не дёргался контент
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

  // плавное появление модалки ввода прогресса
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

  // основной эффект: здесь загружаем данные урока, список упражнений и текущий прогресс
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
        // сначала ищем курс по slug
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
        // параллельно запрашиваем сам урок и список всех тренировок курса
        const [workout, courseWorkouts] = await Promise.all([
          fitnessApi.getWorkoutById(lessonId, token),
          fitnessApi
            .getCourseWorkouts(matchedCourse._id, token)
            .catch(() => []),
        ])
        if (cancelled) return
        // здесь формируем очередь уроков: либо из query-параметра, либо только текущий
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
        // превращаем упражнения из API в удобный формат для интерфейса
        const mappedItems: ExerciseItem[] = workout.exercises.map(
          (exercise, index) => {
            const target = Math.max(1, exercise.quantity)
            return {
              id: exercise._id,
              // key используется для выбора картинки/анимации упражнения
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

        // пробуем подтянуть уже сохранённый прогресс по этому уроку
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
          // если прогресс не нашёлся, просто считаем, что пока 0%
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

  // управление анимацией и автозакрытием модалки "прогресс сохранён"
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

  // есть ли уже какой-то прогресс по упражнениям
  const hasExistingProgress = Object.values(exerciseProgress).some(
    (value) => value > 0
  )
  // можно ли сейчас открывать или сохранять прогресс
  const isProgressActionDisabled =
    isLessonLoading || isSavingProgress || exerciseItems.length === 0
  // заголовок для страницы урока - это название курса, иначе "Тренировка"
  const lessonHeading = courseRef?.title ?? 'Тренировка'
  // строка с id уроков в очереди, которую передаём ниже
  const lessonQueueParam = useMemo(
    () => selectedLessons.map((lesson) => lesson.id).join(','),
    [selectedLessons]
  )

  // если токена нет - отправляем пользователя на главную
  if (!token) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      <main className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[35px] sm:pt-[49px] pb-12">
        <div className="max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px]">
          {/* пока идёт загрузка урока, показываем лоадер */}
          {isLessonLoading && (
            <ProfileCoursesLoading label="Загружаем тренировку" />
          )}
          {/* если произошла ошибка при загрузке урока */}
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
          {/* список уроков в текущей серии, чтобы можно было переключаться */}
          <SelectedLessonsList
            slug={slug}
            lessonId={lessonId}
            selectedLessons={selectedLessons}
            lessonQueueParam={lessonQueueParam}
          />

          {/* блок с видео тренировки */}
          <VideoBlock
            lessonVideoUrl={lessonVideoUrl}
            lessonTitle={lessonTitle}
            showVideo={showVideo}
            onShowVideo={() => setShowVideo(true)}
            videoLoaded={videoLoaded}
            onVideoLoaded={() => setVideoLoaded(true)}
            isLessonLoading={isLessonLoading}
          />

          {/* список упражнений для мобильной и десктопной версий */}
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
      {/* модалка, где пользователь вписывает количество повторений по упражнениям */}
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
      {/* модалка-уведомление о том, что прогресс сохранён */}
      <ProgressSavedModal
        open={progressSavedModalOpen}
        visible={progressSavedModalVisible}
        onClose={closeProgressSavedModal}
      />
    </div>
  )
}
