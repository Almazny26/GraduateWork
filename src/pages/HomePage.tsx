// главная страница со списком всех курсов
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { CourseCard } from '@/components/CourseCard'
import { CourseGridSkeleton } from '@/components/Loading'
import { COURSES } from '@/data/courses'
import { fitnessApi, type ApiCourse } from '@/api/fitness'
import { mapApiCourseToAppCourseRef } from '@/api/mappers'
import { useAuth } from '@/contexts/AuthContext'

// здесь мы заранее задаём порядок курсов, чтобы карточки
// выводились в нужной последовательности по slug
const COURSE_ORDER_BY_SLUG = new Map(
  COURSES.map((course, index) => [course.slug, index])
)

export function HomePage() {
  // из контекста авторизации берём данные пользователя и токен
  const { user, token, openLoginModal, refreshMe } = useAuth()
  // сюда складываем курсы, которые пришли с API
  const [courses, setCourses] = useState<ApiCourse[]>([])
  // флаг, что сейчас идёт загрузка курсов
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  // сюда записываем текст ошибки, если не получилось получить курсы
  const [coursesLoadError, setCoursesLoadError] = useState<string | null>(null)
  // сюда кладём id курса, который сейчас добавляется в профиль
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null)

  // при первом рендере загружаем список курсов с бэкенда
  useEffect(() => {
    setIsLoadingCourses(true)
    setCoursesLoadError(null)
    fitnessApi
      .getCourses()
      .then((data) => {
        // здесь мы на всякий случай проверяем, что пришёл массив
        const list = Array.isArray(data) ? data : []
        setCourses(list)
      })
      .catch(() => {
        // если не получилось получить курсы, показываем ошибку
        setCourses([])
        setCoursesLoadError('Не удалось загрузить курсы с сервера')
      })
      .finally(() => setIsLoadingCourses(false))
  }, [])

  // здесь мы готовим данные для карточек курсов, уже в том формате,
  // который используется в интерфейсе (mapApiCourseToAppCourseRef)
  const cardCourses = useMemo(() => {
    const mapped = courses.map((course) => mapApiCourseToAppCourseRef(course))
    // сортируем курсы по заранее заданному порядку из COURSE_ORDER_BY_SLUG
    return mapped.sort((a, b) => {
      const aOrder = COURSE_ORDER_BY_SLUG.get(a.slug)
      const bOrder = COURSE_ORDER_BY_SLUG.get(b.slug)
      if (aOrder === undefined && bOrder === undefined) return 0
      if (aOrder === undefined) return 1
      if (bOrder === undefined) return -1
      return aOrder - bOrder
    })
  }, [courses])

  // обработчик нажатия на кнопку "добавить курс" на карточке
  const handleAddCourseFromCard = async (courseId: string) => {
    // если пользователь не залогинен, то сначала просим его войти
    if (!user || !token) {
      toast('Войдите, чтобы добавить курс')
      openLoginModal()
      return
    }
    // если курс уже есть в профиле, просто показываем уведомление
    if (user.selectedCourses.includes(courseId)) {
      toast('Курс уже добавлен')
      return
    }
    // если по какой-то причине ещё нет списка курсов, не даём добавить
    if (courses.length === 0) {
      toast.error('Список курсов API не загружен')
      return
    }
    // чтобы не запустить несколько одинаковых запросов подряд
    if (addingCourseId === courseId) return

    setAddingCourseId(courseId)
    try {
      // просим бэкенд добавить курс пользователю
      await fitnessApi.addCourseToUser(courseId, token)
      // обновляем данные пользователя после добавления курса
      await refreshMe()
      toast.success('Курс добавлен в ваш профиль')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Не удалось добавить курс'
      // если сервер вернул, что курс уже был добавлен, просто обновляю профиль
      if (message.toLowerCase().includes('уже')) {
        await refreshMe()
        toast('Курс уже был добавлен')
      } else {
        toast.error(message)
      }
    } finally {
      // в любом случае снимаем флаг "сейчас добавляем этот курс"
      setAddingCourseId(null)
    }
  }

  return (
    <div id="top" className="min-h-screen bg-page font-sans text-text">
      {/* общий заголовок сайта со ссылками навигации */}
      <Header />
      {/* большой первый экран с описанием и картинкой */}
      <Hero />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[60px] pb-0 sm:pb-14 overflow-visible">
        {/* пока курсы грузятся, показываем "скелетон" вместо карточек */}
        {isLoadingCourses && <CourseGridSkeleton />}
        {!isLoadingCourses && coursesLoadError && (
          <p
            className="text-[18px] text-red-600"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            {coursesLoadError}
          </p>
        )}
        {/* когда загрузка закончилась, показываем сетку карточек курсов */}
        {!isLoadingCourses && (
          <div
            className="grid gap-6 sm:gap-x-[40px] sm:gap-y-[76px] w-full max-w-[1160px] min-w-0 overflow-visible"
            style={{
              gridTemplateColumns:
                'repeat(auto-fill, minmax(min(343px, 100%), 1fr))',
            }}
          >
            {cardCourses.map((course) => (
              <div
                key={course.courseId}
                className="min-w-0 overflow-visible sm:p-2 sm:-m-2"
              >
                <CourseCard
                  title={course.title}
                  imageSrc={course.image}
                  slug={course.slug}
                  onAddCourse={() => handleAddCourseFromCard(course.courseId)}
                  addDisabled={addingCourseId === course.courseId}
                  isAdded={!!user?.selectedCourses.includes(course.courseId)}
                />
              </div>
            ))}
          </div>
        )}
        {/* если не грузится, нет ошибки, но список пустой - честно это показываем */}
        {!isLoadingCourses && !coursesLoadError && cardCourses.length === 0 && (
          <p
            className="pt-6 text-[18px] opacity-70"
            style={{ fontFamily: 'Roboto, sans-serif' }}
          >
            Курсы не найдены.
          </p>
        )}
      </section>
      {/* низ страницы с кнопкой "наверх" */}
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-6 sm:pt-0 pb-12 sm:pb-16">
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
    </div>
  )
}
