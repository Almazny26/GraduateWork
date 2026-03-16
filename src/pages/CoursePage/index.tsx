// страница с подробной информацией по одному курсу
import { useEffect, useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { SkillCourseCard } from '@/components/SkillCourseCard'
import { ProfileCoursesLoading } from '@/components/Loading'
import { CourseDirectionsSection } from '@/components/CourseDirectionsSection'
import { CourseHeroSection } from '@/components/CourseHeroSection'
import { CourseSuitsSection } from '@/components/CourseSuitsSection'
import { useAuth } from '@/contexts/AuthContext'
import { fitnessApi, type ApiCourse } from '@/api/fitness'
import { mapApiCourseToAppCourseRef } from '@/api/mappers'
import { splitDescriptionToBullets } from './courseUtils'

// общие классы для оформления страницы
const PAGE_LAYOUT_CLASS =
  'min-h-screen bg-page font-sans text-text overflow-x-hidden'
const CONTENT_PADDING =
  'max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-10'

export function CoursePage() {
  // slug берётся из адресной строки, это текстовый идентификатор курса
  const { slug } = useParams<{ slug: string }>()
  // данные пользователя и функции для работы с авторизацией
  const { user, token, openLoginModal, refreshMe } = useAuth()
  // здесь мы храним все курсы, которые пришли с API
  const [apiCourses, setApiCourses] = useState<ApiCourse[] | null>(null)
  // флаг загрузки курсов
  const [apiLoading, setApiLoading] = useState(true)
  // текст ошибки, если что-то пошло не так
  const [apiError, setApiError] = useState<string | null>(null)
  // этот флаг показывает, что мы уже попросили добавить курс, но пользователь ещё не залогинился
  const [pendingAddCourse, setPendingAddCourse] = useState(false)
  // отдельный флаг, что сейчас напрямую идёт запрос добавления курса
  const [addCourseLoading, setAddCourseLoading] = useState(false)

  // при смене slug (другой курс) снова загружаем список курсов
  useEffect(() => {
    setApiLoading(true)
    setApiError(null)
    fitnessApi
      .getCourses()
      .then((data) => setApiCourses(data))
      .catch(() => {
        setApiCourses(null)
        setApiError('Не удалось загрузить список курсов.')
      })
      .finally(() => setApiLoading(false))
  }, [slug])

  // здесь мы находим курс, который соответствует текущему slug в адресе
  const apiCourse = useMemo(() => {
    if (!slug || !apiCourses) return null
    return (
      apiCourses.find(
        (item) => mapApiCourseToAppCourseRef(item).slug === slug
      ) ?? null
    )
  }, [slug, apiCourses])

  // а здесь уже приводим курс к удобному для фронтенда формату
  const mappedCourse = useMemo(
    () => (apiCourse ? mapApiCourseToAppCourseRef(apiCourse) : null),
    [apiCourse]
  )

  // если загрузка закончилась, а нужный курс так и не нашли - ставим ошибку
  useEffect(() => {
    if (apiLoading) return
    if (!slug || !apiCourses) return
    if (!apiCourse) setApiError('Курс не найден в API.')
  }, [apiLoading, slug, apiCourses, apiCourse])

  // здесь разбиваем длинное описание курса на отдельные пункты,
  // чтобы удобнее показывать их на странице
  const courseContent = useMemo(() => {
    const bullets = splitDescriptionToBullets(apiCourse?.description)
    return {
      // для кого подходит курс
      suits: apiCourse?.fitting ?? [],
      // направления/темы внутри курса
      directions: apiCourse?.directions ?? [],
      // заголовок на большом баннере
      heroTitle:
        bullets[0] ?? (apiCourse?.nameRU ? `Курс ${apiCourse.nameRU}` : 'Курс'),
      // остальные пункты пойдут списком
      heroBullets: bullets.length > 1 ? bullets.slice(1) : [],
    }
  }, [apiCourse])

  // проверяем, добавлен ли текущий курс пользователем в профиль
  const isSelectedByUser = !!(
    user &&
    apiCourse &&
    user.selectedCourses.includes(apiCourse._id)
  )

  // если пользователь нажал "добавить курс", но ещё не был залогинен,
  // после успешного входа автоматически отправляем запрос на добавление
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
  }, [
    pendingAddCourse,
    user,
    token,
    apiCourse?._id,
    isSelectedByUser,
    refreshMe,
  ])

  // если slug по какой-то причине не пришёл, отправляем на главную
  if (!slug) return <Navigate to="/" replace />

  // обработчик кнопки "добавить курс" на странице курса
  const handleAddCourse = async () => {
    if (!user || !token) {
      // запоминаем, что после логина нужно будет добавить курс
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
    try {
      await fitnessApi.addCourseToUser(apiCourse._id, token)
      await refreshMe()
      setPendingAddCourse(false)
      toast.success('Курс добавлен в ваш профиль')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось добавить курс'
      if (message.toLowerCase().includes('уже')) {
        await refreshMe()
        setPendingAddCourse(false)
        toast('Курс уже был добавлен')
      } else {
        toast.error(message)
      }
    } finally {
      setAddCourseLoading(false)
    }
  }

  // пока курсы ещё грузятся, показываем заглушку-лоадер
  if (apiLoading) {
    return (
      <div className={PAGE_LAYOUT_CLASS}>
        <Header />
        <div className={CONTENT_PADDING}>
          <ProfileCoursesLoading label="Загружаем данные курса" />
        </div>
      </div>
    )
  }

  // если произошла ошибка или курс не найден - показываем сообщение
  if (apiError || !apiCourse || !mappedCourse) {
    return (
      <div className={PAGE_LAYOUT_CLASS}>
        <Header />
        <div className={CONTENT_PADDING}>
          <p style={{ fontFamily: 'Roboto, sans-serif' }}>
            {apiError ?? 'Курс не найден в API.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <Header />
      <div className="relative z-0 max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[60px] flex flex-col">
        {/* карточка с основными данными по курсу */}
        <SkillCourseCard
          imageSrc={mappedCourse.imageSkillCard}
          mobileImageSrc={mappedCourse.image}
          title={mappedCourse.title}
          slug={mappedCourse.slug}
        />
        <CourseSuitsSection suits={courseContent.suits} />
        <CourseDirectionsSection directions={courseContent.directions} />
      </div>
      {/* блоки "для кого подходит" и "какие направления" */}
      <CourseHeroSection
        heroTitle={courseContent.heroTitle}
        heroBullets={courseContent.heroBullets}
        fallbackImage={mappedCourse.image}
        onAddCourse={handleAddCourse}
        addCourseLoading={addCourseLoading}
        isSelectedByUser={isSelectedByUser}
        isLoggedIn={!!user}
      />
    </div>
  )
}
