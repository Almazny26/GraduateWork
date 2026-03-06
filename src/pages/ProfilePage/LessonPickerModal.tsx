import { useEffect, useRef, useState } from 'react'
import { ProfileCoursesLoading } from '@/components/Loading'
import type { PickerLesson } from './types'

type Props = {
  visible: boolean
  onClose: () => void
  lessons: PickerLesson[]
  selectedLessonIds: string[]
  onToggleLesson: (lessonId: string) => void
  onStart: () => void
  isLoading: boolean
  errorMessage: string | null
  onRetry: () => void
  lessonSeriesTitle: string
}

export function LessonPickerModal({
  visible,
  onClose,
  lessons,
  selectedLessonIds,
  onToggleLesson,
  onStart,
  isLoading,
  errorMessage,
  onRetry,
  lessonSeriesTitle,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [thumbTop, setThumbTop] = useState(0)
  const [thumbHeight, setThumbHeight] = useState(116)
  const [hasOverflow, setHasOverflow] = useState(false)

  const updateScrollbar = () => {
    const el = listRef.current
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
      Math.min(
        viewportHeight,
        (viewportHeight / contentHeight) * viewportHeight
      )
    )
    const maxScroll = Math.max(1, contentHeight - viewportHeight)
    const maxThumbTop = Math.max(0, viewportHeight - computedThumbHeight)
    const nextTop = (el.scrollTop / maxScroll) * maxThumbTop
    setThumbHeight(computedThumbHeight)
    setThumbTop(nextTop)
  }

  useEffect(() => {
    const raf = requestAnimationFrame(updateScrollbar)
    return () => cancelAnimationFrame(raf)
  }, [lessons.length])

  useEffect(() => {
    window.addEventListener('resize', updateScrollbar)
    return () => window.removeEventListener('resize', updateScrollbar)
  }, [])

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.35)' }}
      onClick={onClose}
    >
      <div
        className={`lesson-picker-modal rounded-[40px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] transition-all duration-300 ease-out ${
          visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="lesson-picker-title text-[32px] text-left w-full sm:whitespace-nowrap"
          style={{
            minHeight: 35,
            margin: 0,
            color: 'rgba(0, 0, 0, 1)',
            fontFamily:
              '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '110%',
            letterSpacing: 0,
          }}
        >
          Выберите тренировку
        </h3>

        <div className="lesson-picker-content flex flex-col w-full gap-[34px]">
          <div
            ref={listRef}
            onScroll={updateScrollbar}
            className="relative w-[283px] h-[360px] sm:w-full lesson-picker-list lesson-picker-scroll-hide flex flex-col justify-start items-start sm:items-start sm:gap-[10px] overflow-y-scroll overflow-x-hidden box-border sm:box-content pr-[26px] sm:pr-0"
          >
            {isLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <ProfileCoursesLoading label="Загружаем список уроков" />
              </div>
            )}
            {!isLoading && errorMessage && (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-center">
                <p
                  className="text-[16px] leading-[1.2] text-[#202020]"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                >
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-[46px] bg-[#BCEC30] text-[16px] leading-[1.1] text-black sm:hover:opacity-90 transition-opacity"
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
            {!isLoading &&
              !errorMessage &&
              lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex flex-col items-start w-full"
                  style={{ maxWidth: 303, marginTop: index === 0 ? 0 : 10 }}
                >
                  <label
                    className="flex items-center gap-3 cursor-pointer overflow-hidden"
                    style={{
                      width: '100%',
                      padding: '0 0 9.5px 0',
                      borderBottom:
                        index < lessons.length - 1
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
                      onChange={() => onToggleLesson(lesson.id)}
                      className="sr-only"
                    />
                    {selectedLessonIds.includes(lesson.id) ? (
                      <img
                        src="/images/active.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="shrink-0"
                        aria-hidden
                      />
                    ) : (
                      <img
                        src="/images/pasive.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="shrink-0"
                        aria-hidden
                      />
                    )}
                    <span className="flex flex-col justify-center items-start gap-[10px]">
                      <span
                        className="text-[20px] sm:text-[24px]"
                        style={{
                          width: '100%',
                          maxWidth: 320,
                          minHeight: 26,
                          color: 'rgba(0, 0, 0, 1)',
                          fontFamily: 'Roboto, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: '110%',
                          letterSpacing: 0,
                          textAlign: 'left',
                        }}
                      >
                        {lesson.title}
                      </span>
                      <span
                        className="text-[14px] sm:text-[16px]"
                        style={{
                          width: '100%',
                          maxWidth: 320,
                          minHeight: 18,
                          color: 'rgba(0, 0, 0, 1)',
                          fontFamily: 'Roboto, sans-serif',
                          fontStyle: 'normal',
                          fontWeight: 400,
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

          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onStart}
              className="lesson-picker-btn rounded-[46px] bg-[#BCEC30] text-[18px] leading-[1.1] text-black sm:hover:opacity-90 sm:hover:scale-[1.03] transition-all duration-300 ease-out disabled:opacity-60"
              style={{ fontFamily: 'Roboto, sans-serif' }}
              disabled={isLoading || selectedLessonIds.length === 0}
            >
              {isLoading ? 'Загружаем...' : 'Начать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
