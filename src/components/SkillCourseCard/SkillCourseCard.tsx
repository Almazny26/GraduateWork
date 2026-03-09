import './SkillCourseCard.css'
import type { SkillCourseCardProps } from './types'

export function SkillCourseCard({
  imageSrc,
  mobileImageSrc,
  title,
}: SkillCourseCardProps) {
  return (
    <>
      <div className="sm:hidden relative w-[343px] max-w-[343px] h-[389px] rounded-[30px] overflow-hidden cursor-default bg-[rgba(173,97,255,1)]">
        <img
          src={mobileImageSrc || imageSrc}
          alt=""
          className="w-full h-full object-cover object-center"
          width={343}
          height={389}
        />
      </div>

      <div className="hidden sm:block group relative w-full max-w-[1160px] rounded-[30px] overflow-hidden aspect-[1160/310] cursor-default">
        <img
          src={imageSrc}
          alt=""
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out sm:group-hover:scale-105"
          width={1160}
          height={310}
        />
        <span
          className="absolute inset-0 flex items-start pt-[40px] pl-[30px] text-white font-medium text-4xl sm:text-5xl md:text-6xl leading-tight cursor-default transition-[letter-spacing,transform] duration-500 ease-out sm:group-hover:tracking-[0.15em] sm:group-hover:translate-x-8 sm:group-hover:translate-y-5"
          style={{
            fontFamily: 'Roboto, sans-serif',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </span>
      </div>
    </>
  )
}
