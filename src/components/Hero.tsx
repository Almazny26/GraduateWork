/**
 * Реплика в Hero — по макету Figma node 47:2759: пузырь с закруглениями и хвостиком вниз-вправо.
 * Шрифт по макету: 32px normal; отступы адаптивные.
 */
export function Hero() {
  return (
    <section className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-14 lg:px-[140px] pt-[60px] flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8 min-w-0">
      <h1 className="text-[32px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-medium text-[#000000] leading-tight lg:leading-none max-w-[947px]">
        Начните заниматься спортом и улучшите качество жизни
      </h1>
      <div className="relative shrink-0">
        {/* Frame 2043682951: 288×102, flex row center, gap 10, padding 16 20, radius 5, #BCEC30 */}
        <div
          className="relative font-sans flex flex-row justify-center items-center rounded-[5px]"
          style={{
            width: 288,
            height: 102,
            gap: 10,
            padding: '16px 20px',
            background: 'rgba(188, 236, 48, 1)',
          }}
        >
          <p
            className="text-left"
            style={{
              color: 'rgba(32, 32, 32, 1)',
              fontFamily: 'Roboto, sans-serif',
              fontWeight: 400,
              fontSize: '32px',
              lineHeight: '110%',
              letterSpacing: 0,
            }}
          >
            Измени своё
            <br />
            тело за полгода!
          </p>
          {/* Хвостик пузыря вниз и вправо */}
          <span
            className="absolute w-0 h-0 border-l-[16px] border-r-[16px] border-t-[28px] border-l-transparent border-r-transparent"
            style={{
              borderTopColor: 'rgba(188, 236, 48, 1)',
              bottom: '-20px',
              left: '50%',
              marginLeft: '24px',
              transform: 'rotate(15deg)',
            }}
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}
