// здесь находятся функции, которые приводят данные из API к удобному виду для интерфейса
import type { ApiCourse } from '@/api/types'
import type { AppCourseRef } from '@/common.types'
import { COURSES } from '@/data/courses'

export type { AppCourseRef } from '@/common/types'

// некоторые названия курсов могут приходить в разных вариантах,
// здесь задаём словарь, который приводит их к одному slug
const COURSE_SLUG_ALIASES: Record<string, string> = {
  yoga: 'yoga',
  stretching: 'stretching',
  stretch: 'stretching',
  fitness: 'fitness',
  step: 'step',
  'step-aerobics': 'step',
  stepaerobics: 'step',
  bodyflex: 'bodyflex',
  'body-flex': 'bodyflex',
  bodyflexx: 'bodyflex',
  'body-flexx': 'bodyflex',
}

// приводим английское название курса к аккуратному виду для slug
function normalizeCourseNameEN(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

// приводим русское название курса к виду, удобному для сравнения
function normalizeCourseNameRU(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
}

// получаем slug из английского названия курса с учётом словаря алиасов
export function toSlugFromNameEN(nameEN: string): string {
  const normalized = normalizeCourseNameEN(nameEN)
  if (!normalized) return ''
  return COURSE_SLUG_ALIASES[normalized] ?? normalized
}

// по slug пытаемся найти "визуальный" курс из локального списка COURSES
export function getVisualCourseBySlug(slug: string) {
  return COURSES.find((course) => course.slug === slug)
}

// главная функция маппинга курса из API в формат,
// который удобно использовать в компонентах интерфейса
export function mapApiCourseToAppCourseRef(course: ApiCourse): AppCourseRef {
  const slugFromEN = toSlugFromNameEN(course.nameEN)
  const visualByEN = getVisualCourseBySlug(slugFromEN)
  const normalizedNameRU = normalizeCourseNameRU(course.nameRU)
  const visualByRU = normalizedNameRU
    ? COURSES.find(
        (item) => normalizeCourseNameRU(item.title) === normalizedNameRU
      )
    : undefined

  const visual = visualByEN ?? visualByRU
  const slug = visual?.slug ?? slugFromEN

  return {
    courseId: course._id,
    slug,
    title: course.nameRU,
    image: visual?.image ?? '/images/card-yoga.png',
    imageSkillCard:
      visual?.imageSkillCard ?? visual?.image ?? '/images/card-yoga.png',
  }
}
