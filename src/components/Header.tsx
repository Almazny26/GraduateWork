export function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-10 md:px-14 lg:px-[140px] pt-6 sm:pt-[50px] max-w-[1440px] mx-auto w-full min-w-0">
      <div className="flex flex-col gap-2 sm:gap-[15px] min-w-0">
        <a
          href="/"
          className="block w-[180px] sm:w-[220px] h-[29px] sm:h-[35px]"
        >
          <img
            src="/images/logo.svg"
            alt="SkyFitnessPro"
            className="w-full h-full object-contain object-left"
            width={220}
            height={35}
          />
        </a>
        <p className="text-base sm:text-lg text-text opacity-50 leading-tight">
          Онлайн-тренировки для занятий дома
        </p>
      </div>
      <button
        type="button"
        className="flex flex-row justify-center items-center rounded-[46px] hover:opacity-90 transition-opacity shrink-0"
        style={{
          width: 103,
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
        Войти
      </button>
    </header>
  )
}
