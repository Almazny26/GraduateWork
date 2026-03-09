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

const PAGE_LAYOUT_CLASS =
  'min-h-screen bg-page font-sans text-text overflow-x-hidden'
const CONTENT_PADDING =
  'max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-[140px] pt-10'

export function CoursePage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, token, openLoginModal, refreshMe } = useAuth()
  const [apiCourses, setApiCourses] = useState<ApiCourse[] | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [pendingAddCourse, setPendingAddCourse] = useState(false)
  const [addCourseLoading, setAddCourseLoading] = useState(false)

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

  const apiCourse = useMemo(() => {
    if (!slug || !apiCourses) return null
    return (
      apiCourses.find(
        (item) => mapApiCourseToAppCourseRef(item).slug === slug
      ) ?? null
    )
  }, [slug, apiCourses])
  const mappedCourse = useMemo(
    () => (apiCourse ? mapApiCourseToAppCourseRef(apiCourse) : null),
    [apiCourse]
  )

  useEffect(() => {
    if (apiLoading) return
    if (!slug || !apiCourses) return
    if (!apiCourse) setApiError('Курс не найден в API.')
  }, [apiLoading, slug, apiCourses, apiCourse])

  const courseContent = useMemo(() => {
    const bullets = splitDescriptionToBullets(apiCourse?.description)
    return {
      suits: apiCourse?.fitting ?? [],
      directions: apiCourse?.directions ?? [],
      heroTitle:
        bullets[0] ?? (apiCourse?.nameRU ? `Курс ${apiCourse.nameRU}` : 'Курс'),
      heroBullets: bullets.length > 1 ? bullets.slice(1) : [],
    }
  }, [apiCourse])

  const isSelectedByUser = !!(
    user &&
    apiCourse &&
    user.selectedCourses.includes(apiCourse._id)
  )

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

  if (!slug) return <Navigate to="/" replace />

  const handleAddCourse = async () => {
    if (!user || !token) {
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
        <SkillCourseCard
          imageSrc={mappedCourse.imageSkillCard}
          mobileImageSrc={mappedCourse.image}
          title={mappedCourse.title}
          slug={mappedCourse.slug}
        />
        <CourseSuitsSection suits={courseContent.suits} />
        <CourseDirectionsSection directions={courseContent.directions} />
      </div>
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
