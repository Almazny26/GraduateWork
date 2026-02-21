import { percentToReps, repsToPercent } from '@/utils/progress'

describe('progress utils', () => {
  it('converts reps to percent with clamping', () => {
    expect(repsToPercent(10, 20)).toBe(50)
    expect(repsToPercent(25, 20)).toBe(100)
    expect(repsToPercent(-5, 20)).toBe(0)
  })

  it('converts percent to reps with clamping', () => {
    expect(percentToReps(50, 20)).toBe(10)
    expect(percentToReps(120, 20)).toBe(20)
    expect(percentToReps(-10, 20)).toBe(0)
  })

  it('handles zero quantity safely', () => {
    expect(repsToPercent(1, 0)).toBe(100)
    expect(percentToReps(50, 0)).toBe(1)
  })
})

