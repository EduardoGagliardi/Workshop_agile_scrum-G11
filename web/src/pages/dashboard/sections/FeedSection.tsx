import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type FeedSession = {
  id: string
  title: string
  description: string
  type: string
  status: string
  scheduled_at: string
  location: string
  max_participants: number
  host_id: string
  skills: { name: string; category: string } | null
  users: { first_name: string; last_name: string; avatar_url: string | null } | null
  session_registrations: { user_id: string }[]
}

type Props = {
  user: UserProfile
  onViewProfile: (userId: string) => void
}

const TYPE_COLORS: Record<string, string> = {
  'Cours rapide': 'purple',
  'Atelier collectif': 'green',
  'Club thématique': 'yellow',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
}

export function FeedSection({ user, onViewProfile }: Props) {
  const [sessions, setSessions] = useState<FeedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)

  async function fetchSessions() {
    const { data } = await supabase
      .from('sessions')
      .select(`
        id, title, description, type, status, scheduled_at, location, max_participants, host_id,
        skills(name, category),
        users!host_id(first_name, last_name, avatar_url),
        session_registrations(user_id)
      `)
      .eq('status', 'Planifiée')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(20)
    setSessions((data as unknown as FeedSession[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchSessions() }, [])

  async function handleRegister(sessionId: string, isRegistered: boolean) {
    setRegistering(sessionId)
    if (isRegistered) {
      await supabase.from('session_registrations').delete()
        .eq('session_id', sessionId).eq('user_id', user.id)
    } else {
      await supabase.from('session_registrations').insert({
        session_id: sessionId, user_id: user.id,
      })
    }
    setRegistering(null)
    fetchSessions()
  }

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Feed social</h1>
          <p className="section-page-subtitle">Découvrez les prochaines sessions disponibles</p>
        </div>
      </div>

      {loading ? (
        <div className="section-loading"><IonIcon iconName="reload-outline" /> Chargement…</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <IonIcon iconName="share-social-outline" />
          <p>Aucune session à venir pour l'instant.</p>
        </div>
      ) : (
        <div className="feed-list">
          {sessions.map(session => {
            const isRegistered = session.session_registrations.some(r => r.user_id === user.id)
            const isHost = session.host_id === user.id
            const spots = session.max_participants - session.session_registrations.length
            const accentClass = TYPE_COLORS[session.type] ?? 'purple'
            const hostInitials = session.users
              ? session.users.first_name.charAt(0) + session.users.last_name.charAt(0)
              : '?'

            return (
              <article key={session.id} className="feed-card dashboard-card">
                <div className="feed-card-top">
                  <button
                    type="button"
                    className="feed-host-info feed-host-info-clickable"
                    disabled={isHost}
                    onClick={() => onViewProfile(session.host_id)}
                  >
                    {session.users?.avatar_url ? (
                      <img className="profile-avatar" src={session.users.avatar_url} alt="" />
                    ) : (
                      <div className="profile-avatar profile-avatar-initials" style={{ fontSize: '0.8rem' }}>
                        {hostInitials}
                      </div>
                    )}
                    <span>
                      {session.users ? `${session.users.first_name} ${session.users.last_name}` : 'Animateur'}
                    </span>
                  </button>
                  <span className={`session-icon ${accentClass}`}>{session.type.charAt(0)}</span>
                </div>

                <div className="feed-card-body">
                  <h3>{session.title}</h3>
                  {session.skills && (
                    <span className="skill-tag">
                      <IonIcon iconName="library-outline" /> {session.skills.name}
                    </span>
                  )}
                  <p className="feed-description">{session.description}</p>
                </div>

                <div className="feed-card-meta">
                  <span><IonIcon iconName="calendar-outline" />{formatDate(session.scheduled_at)}</span>
                  <span><IonIcon iconName="location-outline" />{session.location}</span>
                  <span><IonIcon iconName="people-outline" />{spots > 0 ? `${spots} place${spots > 1 ? 's' : ''} restante${spots > 1 ? 's' : ''}` : 'Complet'}</span>
                </div>

                {!isHost && (
                  <button
                    type="button"
                    className={isRegistered ? 'ghost-button feed-register-btn' : 'primary-button feed-register-btn'}
                    disabled={registering === session.id || (spots === 0 && !isRegistered)}
                    onClick={() => handleRegister(session.id, isRegistered)}
                  >
                    {registering === session.id ? '…' : isRegistered ? (
                      <><IonIcon iconName="checkmark-circle-outline" /> Inscrit — Se désinscrire</>
                    ) : spots === 0 ? 'Complet' : (
                      <><IonIcon iconName="add-circle-outline" /> S'inscrire</>
                    )}
                  </button>
                )}
                {isHost && (
                  <span className="host-badge"><IonIcon iconName="mic-outline" /> Vous animez cette session</span>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
