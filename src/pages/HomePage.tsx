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
import { logError, logInfo } from '@/utils/logger'

const COURSE_ORDER_BY_SLUG = new Map(COURSES.map((course, index) => [course.slug, index]))

export function HomePage() {
  const { user, token, openLoginModal, refreshMe } = useAuth()
  const [courses, setCourses] = useState<ApiCourse[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [coursesLoadError, setCoursesLoadError] = useState<string | null>(null)
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null)

  useEffect(() => {
    setIsLoadingCourses(true)
    setCoursesLoadError(null)
    logInfo('HomePage', 'load courses started')
    fitnessApi
      .getCourses()
      .then((data) => {
        setCourses(data)
        logInfo('HomePage', 'load courses success', { count: data.length })
      })
      .catch((error) => {
        setCourses([])
        setCoursesLoadError('Не удалось загрузить курсы с сервера')
        logError('HomePage', 'load courses failed', {
          error: error instanceof Error ? error.message : String(error),
        })
      })
      .finally(() => setIsLoadingCourses(false))
  }, [])

  const cardCourses = useMemo(() => {
    const mapped = courses.map((course) => mapApiCourseToAppCourseRef(course))
    return mapped.sort((a, b) => {
      const aOrder = COURSE_ORDER_BY_SLUG.get(a.slug)
      const bOrder = COURSE_ORDER_BY_SLUG.get(b.slug)
      if (aOrder === undefined && bOrder === undefined) return 0
      if (aOrder === undefined) return 1
      if (bOrder === undefined) return -1
      return aOrder - bOrder
    })
  }, [courses])

  const handleAddCourseFromCard = async (courseId: string) => {
    if (!user || !token) {
      toast('Войдите, чтобы добавить курс')
      openLoginModal()
      return
    }
    if (user.selectedCourses.includes(courseId)) {
      toast('Курс уже добавлен')
      return
    }
    if (courses.length === 0) {
      toast.error('Список курсов API не загружен')
      return
    }
    if (addingCourseId === courseId) return

    setAddingCourseId(courseId)
    logInfo('HomePage', 'add course started', { courseId })
    try {
      await fitnessApi.addCourseToUser(courseId, token)
      await refreshMe()
      toast.success('Курс добавлен в ваш кабинет')
      logInfo('HomePage', 'add course success', { courseId })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось добавить курс'
      if (message.toLowerCase().includes('уже')) {
        await refreshMe()
        toast('Курс уже был добавлен')
        logInfo('HomePage', 'add course already added', { courseId })
      } else {
        toast.error(message)
        logError('HomePage', 'add course failed', { courseId, message })
      }
    } finally {
      setAddingCourseId(null)
    }
  }

  return (
    <div id="top" className="min-h-screen bg-page font-sans text-text">
      <Header />
      <Hero />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-[40px] sm:pt-[60px] pb-0 sm:pb-14 overflow-visible">
        {isLoadingCourses && <CourseGridSkeleton />}
        {!isLoadingCourses && coursesLoadError && (
          <p className="text-[18px] text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {coursesLoadError}
          </p>
        )}
        {!isLoadingCourses && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-[40px] sm:gap-y-[76px] w-full max-w-[1160px] min-w-0 overflow-visible">
            {cardCourses.map((course) => (
              <div key={course.courseId} className="overflow-visible sm:p-2 sm:-m-2">
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
        {!isLoadingCourses && !coursesLoadError && cardCourses.length === 0 && (
          <p className="pt-6 text-[18px] opacity-70" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Курсы не найдены.
          </p>
        )}
      </section>
      <footer className="max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-6 sm:pt-0 pb-12 sm:pb-16">
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
    </div>
  )
}
