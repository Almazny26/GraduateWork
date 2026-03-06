import { useEffect, useRef, useState } from 'react'
import type { ExerciseItem } from './types'

type Props = {
  open: boolean
  visible: boolean
  exerciseItems: ExerciseItem[]
  draftProgress: Record<string, string>
  onDraftChange: (next: Record<string, string>) => void
  onSave: () => void
  onClose: () => void
  isSaving: boolean
}

export function ProgressModal({
  open,
  visible,
  exerciseItems,
  draftProgress,
  onDraftChange,
  onSave,
  onClose,
  isSaving,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    thumbTop: 0,
    thumbHeight: 116,
  })

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current

    const update = () => {
      const viewportHeight = el.clientHeight
      const contentHeight = el.scrollHeight
      const hasOverflow = contentHeight > viewportHeight + 1
      if (!hasOverflow) {
        setScrollState({
          hasOverflow: false,
          thumbTop: 0,
          thumbHeight: viewportHeight,
        })
        return
      }
      const thumbHeight = Math.max(
        116,
        Math.min(
          viewportHeight,
          (viewportHeight / contentHeight) * viewportHeight
        )
      )
      const maxScrollTop = Math.max(1, contentHeight - viewportHeight)
      const maxThumbTop = Math.max(0, viewportHeight - thumbHeight)
      const thumbTop = (el.scrollTop / maxScrollTop) * maxThumbTop
      setScrollState({ hasOverflow: true, thumbTop, thumbHeight })
    }

    const onScroll = () => update()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(update)
        : null
    if (ro) {
      ro.observe(el)
      if (el.firstElementChild) ro.observe(el.firstElementChild)
    }
    window.addEventListener('resize', update)
    update()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={`fixed inset-0 z-[130] flex items-center justify-center px-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0, 0, 0, 0.35)' }}
      onClick={onClose}
    >
      <div
        className={`progress-modal bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] rounded-[20px] flex flex-col justify-start items-center transition-all duration-300 ease-out ${
          visible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-2 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full flex flex-col progress-modal-content"
          style={{ flex: 1, minHeight: 0 }}
        >
          <h3
            className="text-[32px]"
            style={{
              width: '100%',
              maxWidth: 263,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily:
                '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: 400,
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
              margin: 0,
            }}
          >
            Мой прогресс
          </h3>

          <div className="relative min-w-0 flex-1 min-h-0">
            <div
              ref={listRef}
              className="progress-modal-scroll lesson-picker-scroll-hide overflow-y-auto overflow-x-hidden min-w-0 flex flex-col justify-start items-center"
              style={{
                height: 'calc(100% - 12px)',
                minHeight: 0,
                paddingRight: 20,
              }}
            >
              <div
                className="progress-modal-scroll-inner flex flex-col w-full"
                style={{ gap: 20 }}
              >
                {exerciseItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col min-w-0"
                    style={{ gap: 10 }}
                  >
                    <label
                      className="text-[16px] sm:text-[18px] break-words"
                      style={{
                        color: 'rgba(0, 0, 0, 1)',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 400,
                        lineHeight: '110%',
                        letterSpacing: 0,
                        textAlign: 'left',
                      }}
                    >
                      {item.question}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      value={draftProgress[item.id] ?? ''}
                      onChange={(e) =>
                        onDraftChange({
                          ...draftProgress,
                          [item.id]: e.target.value.replace(/[^\d]/g, ''),
                        })
                      }
                      className="w-full rounded-[10px] border border-[#C4C4C4] bg-white px-[18px]"
                      style={{
                        height: 47,
                        color: 'rgba(0, 0, 0, 1)',
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 400,
                        fontSize: 20,
                        lineHeight: '110%',
                        letterSpacing: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {scrollState.hasOverflow && (
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
                    pointerEvents: 'none',
                  }}
                />
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    top: scrollState.thumbTop,
                    right: 0,
                    width: 6,
                    height: scrollState.thumbHeight,
                    borderRadius: 10,
                    background: 'rgba(0, 0, 0, 1)',
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="progress-modal-save-btn flex flex-row justify-center items-center rounded-[46px] sm:hover:opacity-90 transition-opacity disabled:opacity-60 w-[263px] h-[52px] self-center gap-2.5 px-[26px] py-4 bg-[rgba(188,236,48,1)] text-black font-normal text-lg leading-[1.1] text-center"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {isSaving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>
    </div>
  )
}
