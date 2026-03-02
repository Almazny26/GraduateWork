import type { ExerciseItem } from './types'

type Props = {
  lessonTitle: string
  exerciseItems: ExerciseItem[]
  exerciseProgress: Record<string, number>
  onOpenProgressModal: () => void
  disabled: boolean
  hasExistingProgress: boolean
}

const progressBarStyle = {
  width: '100%',
  height: 6,
  borderRadius: 50,
  background: 'rgba(247, 247, 247, 1)',
  overflow: 'hidden' as const,
}
const progressFillStyle = {
  borderRadius: 50,
  background: 'rgba(0, 193, 255, 1)',
  transition: 'width 300ms ease-out',
}

function ExerciseRow({
  item,
  progress,
}: {
  item: ExerciseItem
  progress: number
}) {
  return (
    <div className="flex flex-col gap-[10px]">
      <span
        style={{
          color: 'rgba(0, 0, 0, 1)',
          fontFamily: 'Roboto, sans-serif',
          fontStyle: 'normal',
          fontWeight: 400,
          fontSize: 18,
          lineHeight: '110%',
          letterSpacing: 0,
          textAlign: 'left',
          whiteSpace: 'pre-line',
        }}
      >
        {`${item.label} ${progress}%`}
      </span>
      <div style={progressBarStyle}>
        <div
          style={{
            ...progressFillStyle,
            width: `${progress}%`,
            height: '100%',
          }}
        />
      </div>
    </div>
  )
}

export function ExercisesListMobile({
  lessonTitle,
  exerciseItems,
  exerciseProgress,
  onOpenProgressModal,
  disabled,
  hasExistingProgress: _,
}: Props) {
  return (
    <section
      className="sm:hidden w-full max-w-[343px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
      style={{ padding: 30 }}
    >
      <div className="flex flex-col w-full gap-[40px]">
        <div className="flex flex-col gap-[20px]">
          <h2
            style={{
              width: '100%',
              maxWidth: 283,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: 32,
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            {`Упражнения ${lessonTitle}`}
          </h2>
          <div className="flex flex-col gap-[24px] w-full max-w-[283px]">
            {exerciseItems.map((item) => (
              <ExerciseRow
                key={item.id}
                item={item}
                progress={exerciseProgress[item.id] ?? 0}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenProgressModal}
          disabled={disabled}
          className="w-[283px] h-[52px] flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity"
          style={{
            padding: '16px 26px',
            background: 'rgba(188, 236, 48, 1)',
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '110%',
            letterSpacing: 0,
            textAlign: 'center',
            opacity: disabled ? 0.65 : 1,
          }}
        >
          Обновить свой прогресс
        </button>
      </div>
    </section>
  )
}

export function ExercisesListDesktop({
  lessonTitle,
  exerciseItems,
  exerciseProgress,
  onOpenProgressModal,
  disabled,
  hasExistingProgress,
}: Props) {
  const columns = [0, 1, 2].map((colIndex) =>
    exerciseItems.filter((_, index) => index % 3 === colIndex)
  )

  return (
    <section
      className="hidden sm:block w-full rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]"
      style={{
        maxWidth: 1160,
        minHeight: 375,
        padding: 30,
        marginBottom: 260,
        marginTop: 8,
      }}
    >
      <div
        className="flex flex-col"
        style={{
          width: '100%',
          maxWidth: 1080,
          minHeight: 295,
          gap: 40,
        }}
      >
        <div className="flex flex-col" style={{ gap: 20 }}>
          <h2
            style={{
              width: '100%',
              maxWidth: 403,
              color: 'rgba(0, 0, 0, 1)',
              fontFamily:
                '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: 'clamp(28px, 3.2vw, 32px)',
              lineHeight: '110%',
              letterSpacing: 0,
              textAlign: 'left',
            }}
          >
            {`Упражнения ${lessonTitle}`}
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 items-start"
            style={{ gap: 40 }}
          >
            {columns.map((columnItems, col) => (
              <div
                key={col}
                className="flex flex-col w-full max-w-[283px] sm:max-w-[333px]"
                style={{ gap: 20 }}
              >
                {columnItems.map((item) => (
                  <ExerciseRow
                    key={item.id}
                    item={item}
                    progress={exerciseProgress[item.id] ?? 0}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenProgressModal}
          disabled={disabled}
          className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity max-w-[283px] sm:max-w-[274px]"
          style={{
            width: '100%',
            height: 52,
            padding: '16px 26px',
            background: 'rgba(188, 236, 48, 1)',
            color: 'rgba(0, 0, 0, 1)',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '110%',
            letterSpacing: 0,
            textAlign: 'center',
            opacity: disabled ? 0.65 : 1,
          }}
        >
          {hasExistingProgress
            ? 'Обновить свой прогресс'
            : 'Заполнить свой прогресс'}
        </button>
      </div>
    </section>
  )
}
