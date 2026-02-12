import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Header } from '@/components/Header'
import { getCourseBySlug } from '@/data/courses'
import {
  getLessonByCourseAndLessonId,
  getLessonsByCourseSlug,
} from '@/data/lessons'

export function LessonPage() {
  const navigate = useNavigate()
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()

  const course = slug ? getCourseBySlug(slug) : undefined
  const lesson = slug && lessonId ? getLessonByCourseAndLessonId(slug, lessonId) : undefined
  const courseLessons = useMemo(
    () => (slug ? getLessonsByCourseSlug(slug) : []),
    [slug],
  )
  const [doneTasks, setDoneTasks] = useState<Record<string, boolean>>({})

  if (!course || !lesson) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="min-h-screen bg-page font-sans text-text">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[50px] sm:pt-[70px] pb-12">
        <div className="max-w-[1160px] flex flex-col gap-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1
              className="text-left text-[40px] leading-[1.1] text-black"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}
            >
              {course.title}: {lesson.title}
            </h1>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="rounded-[46px] border border-black px-6 py-3 text-[18px] leading-[1.1] hover:bg-black/5 transition-colors"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Назад в профиль
            </button>
          </div>

          <section className="rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] p-6 sm:p-8">
            <h2
              className="text-[28px] sm:text-[32px] leading-[1.1] mb-5"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Материалы урока
            </h2>
            <div className="w-full overflow-hidden rounded-[20px] bg-black">
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={lesson.youtubeEmbedUrl}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <section className="rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] p-6 sm:p-8">
            <h2
              className="text-[28px] sm:text-[32px] leading-[1.1] mb-5"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Задания к уроку
            </h2>
            <div className="flex flex-col gap-3">
              {lesson.tasks.map((task) => (
                <label
                  key={task}
                  className="flex items-start gap-3 rounded-[16px] bg-[#F7F7F7] px-4 py-3"
                >
                  <input
                    type="checkbox"
                    checked={!!doneTasks[task]}
                    onChange={(e) =>
                      setDoneTasks((prev) => ({ ...prev, [task]: e.target.checked }))
                    }
                    className="mt-1 w-4 h-4 accent-lime-500"
                  />
                  <span
                    className="text-[18px] leading-[1.2]"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {task}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] p-6 sm:p-8">
            <h2
              className="text-[24px] sm:text-[28px] leading-[1.1] mb-4"
              style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}
            >
              Другие уроки этой тренировки
            </h2>
            <div className="flex flex-wrap gap-3">
              {courseLessons.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/course/${course.slug}/lesson/${item.id}`)}
                  className={`rounded-[46px] px-4 py-2 text-[16px] leading-[1.1] transition-all duration-200 ${
                    item.id === lesson.id
                      ? 'bg-[#BCEC30] text-black'
                      : 'bg-[#F7F7F7] text-[#202020] hover:bg-[#EDEDED]'
                  }`}
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
