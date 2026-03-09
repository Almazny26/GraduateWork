import { Link } from 'react-router-dom'
import type { SelectedLessonItem } from '@/pages/LessonPage/types'

type Props = {
  slug: string | undefined
  lessonId: string | undefined
  selectedLessons: SelectedLessonItem[]
  lessonQueueParam: string
}

export function SelectedLessonsList({
  slug,
  lessonId,
  selectedLessons,
  lessonQueueParam,
}: Props) {
  if (selectedLessons.length <= 1) return null

  return (
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
                  : 'border-black/10 bg-white sm:hover:bg-black/5'
              }`}
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              {`${index + 1}. ${lesson.title}`}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
