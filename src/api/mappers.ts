import type { ApiCourse } from '@/api/fitness'
import { COURSES } from '@/data/courses'

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

function normalizeCourseNameEN(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

function normalizeCourseNameRU(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
}

export function toSlugFromNameEN(nameEN: string): string {
  const normalized = normalizeCourseNameEN(nameEN)
  if (!normalized) return ''
  return COURSE_SLUG_ALIASES[normalized] ?? normalized
}

export function getVisualCourseBySlug(slug: string) {
  return COURSES.find((course) => course.slug === slug)
}

export type AppCourseRef = {
  courseId: string
  slug: string
  title: string
  image: string
  imageSkillCard: string
}

export function mapApiCourseToAppCourseRef(course: ApiCourse): AppCourseRef {
  const slugFromEN = toSlugFromNameEN(course.nameEN)
  const visualByEN = getVisualCourseBySlug(slugFromEN)
  const normalizedNameRU = normalizeCourseNameRU(course.nameRU)
  const visualByRU =
    normalizedNameRU
      ? COURSES.find(
          (item) => normalizeCourseNameRU(item.title) === normalizedNameRU,
        )
      : undefined

  const visual = visualByEN ?? visualByRU
  const slug = visual?.slug ?? slugFromEN

  return {
    courseId: course._id,
    slug,
    title: course.nameRU,
    image: visual?.image ?? '/images/card-yoga.png',
    imageSkillCard: visual?.imageSkillCard ?? visual?.image ?? '/images/card-yoga.png',
  }
}

