// список курсов для карточек: слаг, название, картинки (с API маппим по slug)
export const COURSES = [
  {
    id: 'yoga',
    slug: 'yoga',
    title: 'Йога',
    image: '/images/card-yoga.png',
    imageSkillCard: '/images/skill%20card%201_1.png',
  },
  {
    id: 'stretching',
    slug: 'stretching',
    title: 'Стретчинг',
    image: '/images/card-stretching.png',
    imageSkillCard: '/images/skill%20card%202_2.png',
  },
  {
    id: 'fitness',
    slug: 'fitness',
    title: 'Фитнес',
    image: '/images/card-fitness.png',
    imageSkillCard: '/images/skill%20card%203_3.png',
  },
  {
    id: 'step',
    slug: 'step',
    title: 'Степ-аэробика',
    image: '/images/card-step.png',
    imageSkillCard: '/images/skill%20card%204_4.png',
  },
  {
    id: 'bodyflex',
    slug: 'bodyflex',
    title: 'Бодифлекс',
    image: '/images/card-bodyflex.png',
    imageSkillCard: '/images/skill%20card%205_5.png',
  },
]

export type Course = (typeof COURSES)[number]
