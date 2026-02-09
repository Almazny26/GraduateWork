/**
 * Карточка курса (skill card) — фон без текста, текст наложен сверху.
 * При наведении: растяжение слова + небольшое смещение вправо и вниз (к центру).
 */
type SkillCourseCardProps = {
  imageSrc: string
  title: string
  slug?: string
}

export function SkillCourseCard({ imageSrc, title }: SkillCourseCardProps) {
  return (
    <div className="group relative w-full max-w-[1160px] rounded-[30px] overflow-hidden aspect-[1160/310] cursor-default">
      <img
        src={imageSrc}
        alt=""
        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
        width={1160}
        height={310}
      />
      <span
        className="absolute inset-0 flex items-start pt-[40px] pl-[30px] text-white font-medium text-4xl sm:text-5xl md:text-6xl leading-tight cursor-default transition-[letter-spacing,transform] duration-500 ease-out group-hover:tracking-[0.15em] group-hover:translate-x-8 group-hover:translate-y-5"
        style={{
          fontFamily: 'Roboto, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        {title}
      </span>
    </div>
  )
}
