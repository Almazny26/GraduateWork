import { useState } from 'react'

type Props = {
  heroTitle: string
  heroBullets: string[]
  fallbackImage: string
  onAddCourse: () => void
  addCourseLoading: boolean
  isSelectedByUser: boolean
  isLoggedIn: boolean
}

function AddCourseButton({
  onAddCourse,
  addCourseLoading,
  isSelectedByUser,
  isLoggedIn,
  className,
  fontSize = 16,
}: {
  onAddCourse: () => void
  addCourseLoading: boolean
  isSelectedByUser: boolean
  isLoggedIn: boolean
  className?: string
  fontSize?: number
}) {
  const label = !isLoggedIn
    ? 'Войдите, чтобы добавить курс'
    : isSelectedByUser
      ? 'Курс уже добавлен'
      : addCourseLoading
        ? 'Добавляем...'
        : 'Добавить курс'
  return (
    <button
      type="button"
      onClick={onAddCourse}
      disabled={addCourseLoading}
      className={className}
      style={{
        backgroundColor: 'rgba(188, 236, 48, 1)',
        color: 'rgba(0, 0, 0, 1)',
        fontFamily: 'Roboto, sans-serif',
        fontWeight: 400,
        fontSize,
        lineHeight: '110%',
        letterSpacing: '0px',
      }}
    >
      <span className="text-center min-w-0 break-words">{label}</span>
    </button>
  )
}

export function CourseHeroSection({
  heroTitle,
  heroBullets,
  fallbackImage,
  onAddCourse,
  addCourseLoading,
  isSelectedByUser,
  isLoggedIn,
}: Props) {
  const [showcaseHovered, setShowcaseHovered] = useState(false)

  return (
    <section className="relative z-[120] max-w-[1440px] mx-auto px-4 sm:px-10 md:px-14 lg:px-14 xl:px-[140px] pt-0 sm:pt-0 pb-0 sm:pb-[90px]">
      {/* мобильный вариант */}
      <div className="md:hidden relative mt-[156px] pb-[30px] w-full max-w-[343px] mx-auto">
        <div
          className="pointer-events-none absolute z-[70]"
          style={{
            left: '-74px',
            top: '-265px',
            width: '500px',
            height: '472px',
          }}
          aria-hidden
        >
          <img
            src="/images/green_line.svg?v=2"
            alt=""
            className="absolute object-contain"
            style={{
              left: 0,
              top: '85.92px',
              width: '492px',
              height: '386px',
            }}
          />
          <img
            src="/images/man.png"
            alt=""
            className="absolute object-contain"
            style={{
              left: '148px',
              top: '7.93px',
              width: '343px',
              height: '378px',
            }}
            onError={(e) => {
              const img = e.currentTarget
              if (img.getAttribute('data-fallback')) return
              img.setAttribute('data-fallback', '1')
              img.src = fallbackImage
            }}
          />
          <img
            src="/images/black_line.svg?v=4"
            alt=""
            className="absolute"
            style={{
              left: '212px',
              top: '88px',
              width: '56px',
              height: '36px',
              opacity: 1,
            }}
          />
        </div>

        <div className="relative z-[90] w-full rounded-[30px] bg-white px-6 pb-6 pt-[30px] shadow-[0px_4px_67px_-12px_rgba(0,0,0,0.13)]">
          <div className="flex flex-col gap-6">
            <h2
              className="text-left max-w-[240px]"
              style={{
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: 32,
                lineHeight: '110%',
                letterSpacing: '0px',
                textAlign: 'left',
              }}
            >
              {heroTitle}
            </h2>
            <div
              className="flex flex-col gap-[8px]"
              style={{
                opacity: 0.6,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '110%',
                letterSpacing: 0,
              }}
            >
              {heroBullets.map((line) => (
                <div key={line} className="flex items-start gap-3">
                  <span
                    className="rounded-full shrink-0 w-[4px] h-[4px] mt-[8px]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
                    aria-hidden
                  />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <AddCourseButton
              onAddCourse={onAddCourse}
              addCourseLoading={addCourseLoading}
              isSelectedByUser={isSelectedByUser}
              isLoggedIn={isLoggedIn}
              className="w-full h-[52px] rounded-[46px] hover:opacity-90 hover:scale-[1.03] transition-all duration-300 ease-out flex items-center justify-center px-4 min-w-0 overflow-hidden"
            />
          </div>
        </div>
      </div>

      {/* десктоп: блок с текстом и картинкой */}
      <div className="hidden md:block">
        <div
          className="relative w-full max-w-[1160px] overflow-hidden"
          style={{ minHeight: 588 }}
          onMouseEnter={() => setShowcaseHovered(true)}
          onMouseLeave={() => setShowcaseHovered(false)}
        >
          <div
            className="absolute left-0 w-full rounded-[30px] overflow-hidden"
            style={{
              top: 102,
              width: 1160,
              height: 486,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0px 4px 67px -12px rgba(0, 0, 0, 0.13)',
            }}
          />

          <div
            className="absolute flex flex-col justify-start items-start pointer-events-auto z-10"
            style={{
              left: 40,
              top: 142,
              width: 660,
              maxWidth: 660,
              height: 406,
              gap: 28,
              overflow: 'hidden',
            }}
          >
            <h2
              className="text-left break-words shrink-0"
              style={{
                width: '100%',
                maxWidth: 660,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 500,
                fontSize: 32,
                lineHeight: '110%',
                letterSpacing: 0,
              }}
            >
              {heroTitle}
            </h2>
            <div
              className="flex flex-col gap-y-2 overflow-hidden min-h-0 flex-1 w-full"
              style={{
                maxWidth: 660,
                marginLeft: 5,
                opacity: 0.6,
                color: 'rgba(0, 0, 0, 1)',
                fontFamily: 'Roboto, sans-serif',
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: 18,
                lineHeight: '110%',
                letterSpacing: 0,
                textAlign: 'left',
              }}
            >
              {heroBullets.map((line) => (
                <div
                  key={line}
                  className="flex flex-row items-start gap-3 min-w-0 w-full"
                >
                  <span
                    className="rounded-full shrink-0 w-[6px] h-[6px] mt-[6px]"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 1)' }}
                    aria-hidden
                  />
                  <span className="break-words min-w-0 flex-1">{line}</span>
                </div>
              ))}
            </div>
            <AddCourseButton
              onAddCourse={onAddCourse}
              addCourseLoading={addCourseLoading}
              isSelectedByUser={isSelectedByUser}
              isLoggedIn={isLoggedIn}
              fontSize={18}
              className="flex flex-row justify-center items-center shrink-0 hover:opacity-90 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0px_8px_22px_rgba(188,236,48,0.45)] w-[437px] h-[52px] gap-2.5 px-[26px] py-4 rounded-[46px]"
            />
          </div>

          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              transform: 'translateX(40px) scale(1.06)',
              transformOrigin: '800px 317px',
            }}
          >
            <div
              className="absolute pointer-events-none z-0 opacity-0"
              style={{
                left: 635.19,
                top: 25.4,
                width: 487,
                height: 542.49,
                transform: 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                backgroundColor: 'rgb(217, 217, 217)',
                borderRadius: 2,
              }}
              aria-hidden
              data-animation-layer="outline"
            />

            <div
              className="absolute pointer-events-none z-[1]"
              style={{
                left: 526,
                top: 52,
                width: 565.51,
                height: 567.28,
                transform: showcaseHovered
                  ? 'scale(1.08) rotate(-2.99deg)'
                  : 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                transition:
                  'transform 560ms cubic-bezier(0.16, 1, 0.3, 1), filter 560ms ease-out',
                filter: showcaseHovered
                  ? 'drop-shadow(0 16px 30px rgba(0, 0, 0, 0.22))'
                  : 'drop-shadow(0 5px 12px rgba(0, 0, 0, 0.13))',
              }}
              data-animation-layer="silhouette"
            >
              <img
                src="/images/men_1.png"
                alt=""
                className="w-full h-full object-contain object-center"
              />
            </div>

            <div
              className="absolute pointer-events-none z-0 overflow-visible"
              style={{
                left: 20,
                top: 102,
                width: 1160,
                height: 486,
                borderRadius: 46,
              }}
              aria-hidden
              data-animation-layer="vectors"
            >
              <img
                src="/images/vectors_group.svg"
                alt=""
                className="w-full h-full object-cover object-left-top"
                style={{ objectPosition: '-55px -22px' }}
              />
            </div>

            <div
              className="absolute pointer-events-none z-[2]"
              style={{
                left: 553,
                top: 48.9,
                width: 519.47,
                height: 539.54,
                transform: showcaseHovered
                  ? 'scale(1.08) rotate(-2.99deg)'
                  : 'rotate(-2.99deg)',
                transformOrigin: 'top left',
                transition:
                  'transform 560ms cubic-bezier(0.16, 1, 0.3, 1), filter 560ms ease-out',
                filter: showcaseHovered
                  ? 'drop-shadow(0 28px 46px rgba(0, 0, 0, 0.3))'
                  : 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15))',
              }}
            >
              <img
                src="/images/man.png"
                alt=""
                className="w-full h-full object-contain object-center"
                style={{ objectFit: 'contain' }}
                onError={(e) => {
                  const img = e.currentTarget
                  if (img.getAttribute('data-fallback')) return
                  img.setAttribute('data-fallback', '1')
                  img.src = fallbackImage
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
