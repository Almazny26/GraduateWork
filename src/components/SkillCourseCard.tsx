/**
 * Карточка курса (skill card) — цельное изображение из макета (skill card 1–5.png).
 * 1160×310, radius 30px по макету.
 */
type SkillCourseCardProps = {
  /** Путь к изображению всей карточки (skill card 1.png … skill card 5.png) */
  imageSrc: string
  /** Подпись для доступности (название курса) */
  title: string
}

export function SkillCourseCard({ imageSrc, title }: SkillCourseCardProps) {
  return (
    <div className="w-full max-w-[1160px] rounded-[30px] overflow-hidden aspect-[1160/310]">
      <img
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover object-center"
        width={1160}
        height={310}
      />
    </div>
  )
}
