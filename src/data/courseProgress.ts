const STORAGE_KEY = 'skyfitnesspro-course-progress'

const DEFAULT_COURSE_PROGRESS: Record<string, number> = {
  yoga: 40,
  stretching: 0,
  fitness: 100,
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function getCourseProgressMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_COURSE_PROGRESS }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const normalized = Object.fromEntries(
      Object.entries(parsed).map(([slug, value]) => [slug, clampPercent(Number(value))]),
    )
    return { ...DEFAULT_COURSE_PROGRESS, ...normalized }
  } catch {
    return { ...DEFAULT_COURSE_PROGRESS }
  }
}

export function getCourseProgressBySlug(slug: string): number {
  const progressMap = getCourseProgressMap()
  return clampPercent(progressMap[slug] ?? 0)
}

export function setCourseProgressBySlug(slug: string, progress: number): void {
  const next = {
    ...getCourseProgressMap(),
    [slug]: clampPercent(progress),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

