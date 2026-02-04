/** Цвета skill card по макету Figma: 1160×310, radius 30px, фон и белый текст */
export const COURSE_COLORS: Record<string, string> = {
  yoga: 'rgba(255, 199, 0, 1)', // skill card 1
  stretching: 'rgba(36, 145, 210, 1)', // skill card 2
  fitness: 'rgba(247, 160, 18, 1)', // skill card 3
  step: 'rgba(255, 126, 101, 1)', // skill card 4
  bodyflex: 'rgba(125, 69, 140, 1)', // skill card 5
}

export const COURSES = [
  {
    id: 'yoga',
    slug: 'yoga',
    title: 'Йога',
    image: '/images/card-yoga.png',
    imageSkillCard: '/images/skill%20card%201.png',
  },
  {
    id: 'stretching',
    slug: 'stretching',
    title: 'Стретчинг',
    image: '/images/card-stretching.png',
    imageSkillCard: '/images/skill%20card%202.png',
  },
  {
    id: 'fitness',
    slug: 'fitness',
    title: 'Фитнес',
    image: '/images/card-fitness.png',
    imageSkillCard: '/images/skill%20card%203.png',
  },
  {
    id: 'step',
    slug: 'step',
    title: 'Степ-аэробика',
    image: '/images/card-step.png',
    imageSkillCard: '/images/skill%20card%204.png',
  },
  {
    id: 'bodyflex',
    slug: 'bodyflex',
    title: 'Бодифлекс',
    image: '/images/card-bodyflex.png',
    imageSkillCard: '/images/skill%20card%205.png',
  },
]

export type Course = (typeof COURSES)[number]

export function getCourseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug)
}
