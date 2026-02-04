/**
 * Карточка тренировки (урока) для списка на странице курса.
 * Оформление по макету Figma node 46:2743: белая карточка, скругление 20px, тень, заголовок 24px, стрелка справа.
 */
type WorkoutCardProps = {
  name: string
  onClick?: () => void
}

export function WorkoutCard({ name, onClick }: WorkoutCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[20px] flex flex-row justify-between items-center gap-4 min-h-[72px] transition-opacity hover:opacity-90"
      style={{
        padding: '20px 24px',
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
      }}
    >
      <span
        className="text-[24px] font-normal leading-[1.1] text-[#000000]"
        style={{
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
        }}
      >
        {name}
      </span>
      <span
        className="text-[18px] leading-[1.1] shrink-0"
        style={{ color: 'rgba(32, 32, 32, 1)', opacity: 0.7 }}
        aria-hidden
      >
        →
      </span>
    </button>
  )
}
