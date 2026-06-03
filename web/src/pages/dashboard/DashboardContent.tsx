import { useEffect, useState } from 'react'
import { type DashboardSectionId } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'
import { supabase } from '../../lib/supabaseClient'
import type { UserProfile } from '../../types'
import { xpProgress } from '../../types'
import { SessionsSection } from './sections/SessionsSection'
import { SkillsSection } from './sections/SkillsSection'
import { SearchSection } from './sections/SearchSection'
import { MessagesSection } from './sections/MessagesSection'
import { NotificationsSection } from './sections/NotificationsSection'
import { BadgesSection } from './sections/BadgesSection'
import { ProfileSection } from './sections/ProfileSection'
import { SettingsSection } from './sections/SettingsSection'
import { FeedSection } from './sections/FeedSection'
import { PublicUserProfileSection } from './sections/PublicUserProfileSection'

type OverviewSession = {
  id: string
  title: string
  type: string
  scheduled_at: string
  skills: { name: string } | null
  isHost: boolean
}

type DashboardContentProps = {
  user: UserProfile
  onUserUpdate: (user: UserProfile) => void
  activeSectionId: DashboardSectionId
  viewingUserId: string | null
  messageTargetUserId: string | null
  onNavigate: (id: DashboardSectionId) => void
  onViewProfile: (userId: string) => void
  onCloseProfile: () => void
  onOpenOwnProfile: () => void
  onOpenMessages: (targetUserId: string) => void
  onClearMessageTarget: () => void
}

export function DashboardContent({
  user,
  onUserUpdate,
  activeSectionId,
  viewingUserId,
  messageTargetUserId,
  onNavigate,
  onViewProfile,
  onCloseProfile,
  onOpenOwnProfile,
  onOpenMessages,
  onClearMessageTarget,
}: DashboardContentProps) {
  if (viewingUserId) {
    return (
      <PublicUserProfileSection
        currentUser={user}
        profileUserId={viewingUserId}
        onBack={onCloseProfile}
        onOpenOwnProfile={onOpenOwnProfile}
        onOpenMessages={onOpenMessages}
      />
    )
  }

  if (activeSectionId === 'sessions') return <SessionsSection user={user} />
  if (activeSectionId === 'skills') return <SkillsSection user={user} />
  if (activeSectionId === 'search') return <SearchSection onViewProfile={onViewProfile} />
  if (activeSectionId === 'messages') {
    return (
      <MessagesSection
        user={user}
        initialTargetUserId={messageTargetUserId}
        onClearInitialTarget={onClearMessageTarget}
        onViewProfile={onViewProfile}
      />
    )
  }
  if (activeSectionId === 'notifications') return <NotificationsSection user={user} />
  if (activeSectionId === 'badges') return <BadgesSection user={user} />
  if (activeSectionId === 'friends') return <ProfileSection user={user} onUserUpdate={onUserUpdate} />
  if (activeSectionId === 'settings') return <SettingsSection user={user} onUserUpdate={onUserUpdate} />
  if (activeSectionId === 'feed') return <FeedSection user={user} onViewProfile={onViewProfile} />

  return <OverviewSection user={user} onNavigate={onNavigate} />
}

function OverviewSection({ user, onNavigate }: { user: UserProfile; onNavigate: (id: DashboardSectionId) => void }) {
  const [upcomingSessions, setUpcomingSessions] = useState<OverviewSession[]>([])
  const { xpCurrent, xpNeeded, percent } = xpProgress(user.experiencePoints, user.level)

  useEffect(() => {
    async function fetchSessions() {
      const now = new Date().toISOString()

      const [{ data: hosted }, { data: registered }] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, title, type, scheduled_at, skills(name)')
          .eq('host_id', user.id)
          .gte('scheduled_at', now)
          .order('scheduled_at', { ascending: true })
          .limit(3),
        supabase
          .from('session_registrations')
          .select('sessions(id, title, type, scheduled_at, skills(name))')
          .eq('user_id', user.id)
          .gte('sessions.scheduled_at', now)
          .limit(3),
      ])

      const hostedMapped: OverviewSession[] = (hosted ?? []).map((s: any) => ({ ...s, isHost: true }))
      const registeredMapped: OverviewSession[] = (registered ?? [])
        .map((r: any) => r.sessions)
        .filter(Boolean)
        .map((s: any) => ({ ...s, isHost: false }))

      const combined = [...hostedMapped, ...registeredMapped]
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 3)

      setUpcomingSessions(combined)
    }
    fetchSessions()
  }, [user.id])

  function formatShort(iso: string) {
    return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  const typeAccents: Record<string, string> = {
    'Cours rapide': 'purple',
    'Atelier collectif': 'green',
    'Club thématique': 'yellow',
  }

  const typeInitials: Record<string, string> = {
    'Cours rapide': '</>',
    'Atelier collectif': 'AT',
    'Club thématique': 'CL',
  }

  return (
    <div className="dashboard-center">
      <section className="dashboard-card welcome-card">
        <div>
          <h1>Bonjour {user.firstName} ! 👋</h1>
          <p>Prêt(e) à apprendre et à partager aujourd'hui ?</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate('sessions')}>
          <IonIcon iconName="add-outline" />
          Créer une session
        </button>
      </section>

      <section className="dashboard-card sessions-card">
        <CardTitle title="Mes prochaines sessions" actionLabel="Voir tout" onAction={() => onNavigate('sessions')} />
        {upcomingSessions.length === 0 ? (
          <div className="empty-state" style={{ padding: '1.5rem 0' }}>
            <IonIcon iconName="calendar-outline" />
            <p>Aucune session à venir. Rejoignez ou créez une session !</p>
            <button type="button" className="primary-button" onClick={() => onNavigate('feed')}>
              Explorer les sessions
            </button>
          </div>
        ) : (
          <div className="session-list">
            {upcomingSessions.map(session => (
              <article key={session.id} className="session-item">
                <span className={`session-icon ${typeAccents[session.type] ?? 'purple'}`}>
                  {typeInitials[session.type] ?? session.type.charAt(0)}
                </span>
                <div className="session-info">
                  <h3>{session.title}</h3>
                  <p>{session.skills?.name ?? session.type} {session.isHost ? '— Vous animez' : ''}</p>
                </div>
                <div className="session-meta">
                  <span><IonIcon iconName="calendar-outline" />{formatShort(session.scheduled_at)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-card progress-card">
        <CardTitle title="Ma progression" actionLabel="Voir tout" onAction={() => onNavigate('badges')} />
        <div className="progress-summary">
          <div className="progress-ring-wrap">
            <svg viewBox="0 0 86 86" className="progress-ring-svg" aria-hidden="true">
              <circle cx="43" cy="43" r="35" className="progress-ring-track" />
              <circle
                cx="43"
                cy="43"
                r="35"
                className="progress-ring-fill"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * (1 - percent / 100)}`}
              />
            </svg>
            <span className="progress-ring-label">{Math.round(percent)}%</span>
          </div>
          <div className="progress-details">
            <p>Niveau actuel</p>
            <strong>Niveau {user.level}</strong>
            <span>{xpCurrent} / {xpNeeded} XP</span>
          </div>
        </div>
      </section>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-card">
          <CardTitle title="Mes compétences" actionLabel="Gérer" onAction={() => onNavigate('skills')} />
          <QuickSkillsList userId={user.id} />
        </section>

        <section className="dashboard-card">
          <CardTitle title="Découvrir" actionLabel="Voir le feed" onAction={() => onNavigate('feed')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="stat-item">
              <div className="stat-icon-wrap"><IonIcon iconName="search-outline" /></div>
              <strong>Rechercher</strong>
              <span>Trouver des mentors et apprenants</span>
            </div>
            <button type="button" className="primary-button full-width" onClick={() => onNavigate('search')}>
              <IonIcon iconName="search-outline" /> Explorer les compétences
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function QuickSkillsList({ userId }: { userId: string }) {
  const [skills, setSkills] = useState<{ skill_name: string; role: string }[]>([])

  useEffect(() => {
    supabase
      .from('user_skills')
      .select('role, skills(name)')
      .eq('user_id', userId)
      .limit(4)
      .then(({ data }) => {
        setSkills((data ?? []).map((us: any) => ({
          skill_name: Array.isArray(us.skills) ? us.skills[0]?.name ?? '?' : us.skills?.name ?? '?',
          role: us.role,
        })))
      })
  }, [userId])

  if (skills.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Ajoutez vos premières compétences !</p>
  }

  return (
    <ul className="skill-list">
      {skills.map(s => (
        <li key={s.skill_name}>
          <span className="skill-icon-wrap">
            <IonIcon iconName={s.role === 'Enseignant' ? 'school-outline' : 'book-outline'} />
          </span>
          <strong>{s.skill_name}</strong>
          <span>{s.role}</span>
        </li>
      ))}
    </ul>
  )
}

function CardTitle({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction?: () => void }) {
  return (
    <div className="card-title">
      <h2>{title}</h2>
      <button type="button" onClick={onAction}>{actionLabel}</button>
    </div>
  )
}
