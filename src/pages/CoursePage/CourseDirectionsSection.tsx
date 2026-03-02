import { StarIcon } from './StarIcon'

type Props = {
  directions: string[]
}

export function CourseDirectionsSection({ directions }: Props) {
  return (
    <div className="w-full max-w-[343px] sm:max-w-[1160px] flex flex-col gap-[24px] sm:gap-[40px] mt-[40px] sm:mt-[60px]">
      <h2
        className="text-left text-2xl sm:text-[40px] font-normal sm:font-semibold"
        style={{
          color: 'rgba(0, 0, 0, 1)',
          fontFamily: 'Roboto, sans-serif',
          fontStyle: 'normal',
          lineHeight: '110%',
          letterSpacing: 0,
          textAlign: 'left',
        }}
      >
        Направления
      </h2>
      <div
        className="w-[343px] sm:w-full max-w-[343px] sm:max-w-[1160px] h-auto min-h-0 py-[30px] sm:min-h-[146px] rounded-[28px] px-[30px] sm:p-[30px] box-border flex flex-col justify-center items-center overflow-hidden"
        style={{
          gap: 10,
          backgroundColor: 'rgba(188, 236, 48, 1)',
        }}
      >
        <div className="w-full min-w-0 max-w-[283px] flex flex-col justify-start items-start gap-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:items-center sm:gap-x-8 sm:gap-y-4 lg:gap-x-12 lg:gap-y-6">
          {directions.map((name) => (
            <div
              key={name}
              className="flex flex-row items-center gap-2 sm:gap-[8px] min-w-0 shrink-0"
            >
              <StarIcon className="w-[26px] h-[26px] shrink-0 flex-shrink-0" />
              <span
                className="text-[18px] sm:text-[24px] font-normal leading-[1.1] min-w-0 break-words"
                style={{ color: 'rgba(0, 0, 0, 1)' }}
              >
                {name}
              </span>
            </div>
          ))}
          {directions.length === 0 && (
            <p style={{ fontFamily: 'Roboto, sans-serif' }}>
              Сервер пока не вернул направления для этого курса.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
