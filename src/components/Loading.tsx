// полноэкранный оверлей со спиннером пока грузится что-то
type PageLoadingOverlayProps = {
  visible: boolean
  label?: string
}

export function PageLoadingOverlay({
  visible,
  label = 'Загружаем страницу...',
}: PageLoadingOverlayProps) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] bg-white/88 backdrop-blur-[1px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <span className="absolute inset-0 rounded-full border-[4px] border-black/10" />
          <span className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-[#BCEC30] border-r-[#BCEC30] animate-spin" />
        </div>
        <p
          className="text-[18px] leading-[1.1] text-black"
          style={{ fontFamily: 'Roboto, sans-serif' }}
        >
          {label}
        </p>
      </div>
    </div>
  )
}

// заглушки карточек пока грузятся курсы
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-x-[40px] sm:gap-y-[76px] w-full max-w-[1160px] min-w-0 overflow-visible">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`course-skeleton-${index}`}
          className="w-full max-w-[343px] sm:max-w-[360px] h-[492px] sm:h-[486px] rounded-[30px] bg-white shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)] overflow-hidden"
        >
          <div className="sfp-shimmer w-full h-[325px]" />
          <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
            <div className="sfp-shimmer h-8 w-[70%] rounded-[12px]" />
            <div className="flex gap-2">
              <div className="sfp-shimmer h-9 w-28 rounded-[50px]" />
              <div className="sfp-shimmer h-9 w-32 rounded-[50px]" />
            </div>
            <div className="sfp-shimmer h-9 w-24 rounded-[50px]" />
          </div>
        </div>
      ))}
    </div>
  )
}

// текст «Загружаем курсы...» со спиннером для профиля
export function ProfileCoursesLoading({
  label = 'Загружаем курсы профиля',
}: {
  label?: string
} = {}) {
  return (
    <div
      className="inline-flex flex-row items-center gap-3 min-h-[24px]"
      style={{ fontFamily: 'Roboto, sans-serif' }}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-6 h-6 shrink-0" aria-hidden>
        <span className="absolute inset-0 rounded-full border-2 border-black/10" />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#BCEC30] border-r-[#BCEC30] animate-spin"
          style={{ animationDuration: '0.9s' }}
        />
      </div>
      <span
        className="sfp-loading-glow text-[18px] sm:text-[20px] leading-[1.2] text-black"
        style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}
      >
        {label}
      </span>
      <span className="sfp-profile-loading-dots inline-flex gap-0.5 text-[18px] sm:text-[20px] leading-[1.2] text-black">
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </span>
    </div>
  )
}
