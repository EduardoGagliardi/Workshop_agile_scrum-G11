import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type Badge = {
  id: number
  title: string
  description: string
  icon_url: string
}

type Props = { user: UserProfile }

const BADGE_ICONS: Record<string, string> = {
  'Mentor': 'school-outline',
  'Développeur': 'code-slash-outline',
  'Communicant': 'chatbubbles-outline',
  'Pionnier': 'rocket-outline',
  'Explorateur': 'compass-outline',
}

export function BadgesSection({ user }: Props) {
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [unlockedIds, setUnlockedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: badges }, { data: userBadges }] = await Promise.all([
        supabase.from('badges').select('id, title, description, icon_url').order('id'),
        supabase.from('user_badges').select('badge_id').eq('user_id', user.id),
      ])
      setAllBadges((badges as Badge[]) ?? [])
      setUnlockedIds((userBadges ?? []).map((ub: { badge_id: number }) => ub.badge_id))
      setLoading(false)
    }
    fetchData()
  }, [user.id])

  const unlockedCount = unlockedIds.length
  const totalCount = allBadges.length

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Badges</h1>
          <p className="section-page-subtitle">
            {unlockedCount} / {totalCount} badge{totalCount !== 1 ? 's' : ''} débloqué{unlockedCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="section-loading"><IonIcon iconName="reload-outline" /> Chargement…</div>
      ) : allBadges.length === 0 ? (
        <div className="empty-state">
          <IonIcon iconName="ribbon-outline" />
          <p>Aucun badge disponible pour l'instant.</p>
        </div>
      ) : (
        <div className="badges-grid">
          {allBadges.map(badge => {
            const unlocked = unlockedIds.includes(badge.id)
            const iconName = BADGE_ICONS[badge.title] ?? 'ribbon-outline'
            return (
              <div key={badge.id} className={`badge-card dashboard-card ${unlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                <div className="badge-icon-wrap">
                  <IonIcon iconName={iconName} />
                </div>
                <strong>{badge.title}</strong>
                <p>{badge.description}</p>
                {unlocked ? (
                  <span className="badge-status unlocked"><IonIcon iconName="checkmark-circle-outline" /> Débloqué</span>
                ) : (
                  <span className="badge-status locked"><IonIcon iconName="lock-closed-outline" /> Verrouillé</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
