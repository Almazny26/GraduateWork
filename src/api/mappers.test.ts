import { mapApiCourseToAppCourseRef, toSlugFromNameEN } from '@/api/mappers'

describe('api mappers', () => {
  it('converts english name to lowercase slug', () => {
    expect(toSlugFromNameEN('Yoga')).toBe('yoga')
    expect(toSlugFromNameEN('Bodyflex')).toBe('bodyflex')
    expect(toSlugFromNameEN('Step Aerobics')).toBe('step')
    expect(toSlugFromNameEN('body_flexx')).toBe('bodyflex')
  })

  it('maps API course to app course with local visual assets', () => {
    const mapped = mapApiCourseToAppCourseRef({
      _id: 'ab1c3f',
      nameRU: 'Йога',
      nameEN: 'Yoga',
      description: 'desc',
      directions: [],
      fitting: [],
      workouts: [],
    })

    expect(mapped.courseId).toBe('ab1c3f')
    expect(mapped.slug).toBe('yoga')
    expect(mapped.title).toBe('Йога')
    expect(mapped.image).toBe('/images/card-yoga.png')
    expect(mapped.imageSkillCard).toBe('/images/skill%20card%201_1.png')
  })

  it('maps API alias slug to correct visuals', () => {
    const mapped = mapApiCourseToAppCourseRef({
      _id: 'step1',
      nameRU: 'Степ-аэробика',
      nameEN: 'Step Aerobics',
      description: 'desc',
      directions: [],
      fitting: [],
      workouts: [],
    })

    expect(mapped.slug).toBe('step')
    expect(mapped.image).toBe('/images/card-step.png')
    expect(mapped.imageSkillCard).toBe('/images/skill%20card%204_4.png')
  })

  it('prefers visual mapping by russian name when nameEN is unstable', () => {
    const mapped = mapApiCourseToAppCourseRef({
      _id: 'ru1',
      nameRU: 'Степ-аэробика',
      nameEN: 'Some Unexpected API Name',
      description: 'desc',
      directions: [],
      fitting: [],
      workouts: [],
    })

    expect(mapped.slug).toBe('step')
    expect(mapped.image).toBe('/images/card-step.png')
    expect(mapped.imageSkillCard).toBe('/images/skill%20card%204_4.png')
  })

  it('falls back to default image when no visual mapping exists', () => {
    const mapped = mapApiCourseToAppCourseRef({
      _id: 'x1',
      nameRU: 'Новый курс',
      nameEN: 'Unknown',
      description: 'desc',
      directions: [],
      fitting: [],
      workouts: [],
    })

    expect(mapped.slug).toBe('unknown')
    expect(mapped.image).toBe('/images/card-yoga.png')
    expect(mapped.imageSkillCard).toBe('/images/card-yoga.png')
  })
})

