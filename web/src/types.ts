export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  bio: string | null
  avatarUrl: string | null
  accountType: 'Étudiant' | 'Formateur'
  experiencePoints: number
  level: number
}

export function xpProgress(experiencePoints: number, level: number) {
  const xpStart = 500 * level * (level - 1) / 2
  const xpNeeded = 500 * level
  const xpCurrent = Math.max(0, experiencePoints - xpStart)
  return { xpCurrent, xpNeeded, percent: Math.min(100, (xpCurrent / xpNeeded) * 100) }
}
