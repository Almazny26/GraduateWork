// повторения в проценты (для отображения прогресса)
export function repsToPercent(reps: number, quantity: number): number {
  const safeQuantity = Math.max(1, quantity)
  const raw = Math.round((reps / safeQuantity) * 100)
  return Math.min(100, Math.max(0, raw))
}

// обратно - процент в кол-во повторений
export function percentToReps(percent: number, quantity: number): number {
  const safeQuantity = Math.max(1, quantity)
  const safePercent = Math.min(100, Math.max(0, percent))
  return Math.round((safePercent / 100) * safeQuantity)
}
