// режу описание на пункты - по точкам и вопросительным в конце предложений
export function splitDescriptionToBullets(description?: string): string[] {
  if (!description) return []
  return description
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}
