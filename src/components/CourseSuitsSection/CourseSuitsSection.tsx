type Props = {
  suits: string[]
}

export function CourseSuitsSection({ suits }: Props) {
  return (
    <section
      className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]"
      aria-labelledby="suits-heading"
    >
      <h2
        id="suits-heading"
        className="text-left text-2xl sm:text-[40px] font-normal sm:font-semibold"
        style={{
          width: '100%',
          maxWidth: 810,
          color: 'rgba(0, 0, 0, 1)',
          fontFamily: 'Roboto, sans-serif',
          fontStyle: 'normal',
          lineHeight: '110%',
          letterSpacing: 0,
          textAlign: 'left',
        }}
      >
        Подойдет для вас, если:
      </h2>
      <div
        className="flex flex-col sm:flex-row sm:flex-wrap items-stretch"
        style={{ gap: 17 }}
      >
        {suits.map((text, i) => (
          <div
            key={i}
            className="rounded-[28px] flex flex-col justify-start items-start min-w-0 flex-1 basis-full sm:basis-[280px] max-w-[343px] sm:max-w-full box-border overflow-hidden"
            style={{
              minWidth: 0,
              height: 'auto',
              minHeight: 0,
              padding: 20,
              gap: 10,
              background:
                'linear-gradient(152.61deg, rgba(21.46, 23.48, 31.57, 1), rgba(30.28, 33.45, 46.14, 1))',
            }}
          >
            <div className="flex flex-row justify-start items-center gap-[25px] flex-1 min-w-0 w-full box-border">
              <span
                className="shrink-0 leading-[1.35]"
                style={{
                  color: 'rgba(188, 236, 48, 1)',
                  fontFamily: 'Roboto, sans-serif',
                  fontWeight: 500,
                  fontSize: '75px',
                  letterSpacing: 0,
                  textAlign: 'left',
                }}
              >
                {i + 1}
              </span>
              <span
                className="min-w-0 flex-1 break-words whitespace-pre-line block text-left font-normal text-[18px] sm:text-[24px]"
                style={{
                  color: 'rgba(255, 255, 255, 1)',
                  fontFamily: 'Roboto',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '110%',
                  letterSpacing: '0px',
                  textAlign: 'left',
                }}
              >
                {text}
              </span>
            </div>
          </div>
        ))}
        {suits.length === 0 && (
          <p style={{ fontFamily: 'Roboto, sans-serif' }}>
            Сервер пока не вернул рекомендации для этого курса.
          </p>
        )}
      </div>
    </section>
  )
}
