import { useCallback, useEffect, useState } from 'react'
import { findOrCreateConversation } from '../../../lib/conversations'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'
import { xpProgress } from '../../../types'

type PublicProfile = {
  id: string
  firstName: string
  lastName: string
  bio: string | null
  avatarUrl: string | null
  accountType: UserProfile['accountType']
  experiencePoints: number
  level: number
}

type UserSkillRow = {
  role: string
  level: string
  skills: { name: string } | { name: string }[] | null
}

type UserBadgeRow = {
  unlocked_at: string
  badges: { title: string; description: string } | { title: string; description: string }[] | null
}

type ContactStatus = 'self' | 'contact' | 'pending_sent' | 'pending_received' | 'none'

const BADGE_ICONS: Record<string, string> = {
  Mentor: 'school-outline',
  Développeur: 'code-slash-outline',
  Communicant: 'chatbubbles-outline',
  Pionnier: 'rocket-outline',
  Explorateur: 'compass-outline',
}

type Props = {
  currentUser: UserProfile
  profileUserId: string
  onBack: () => void
  onOpenOwnProfile: () => void
  onOpenMessages: (targetUserId: string) => void
}

export function PublicUserProfileSection({
  currentUser,
  profileUserId,
  onBack,
  onOpenOwnProfile,
  onOpenMessages,
}: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [skills, setSkills] = useState<{ name: string; role: string; level: string }[]>([])
  const [badges, setBadges] = useState<{ title: string; description: string; unlockedAt: string }[]>([])
  const [contactStatus, setContactStatus] = useState<ContactStatus>('none')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')

  const isOwnProfile = profileUserId === currentUser.id

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    setActionMessage('')
    setActionError('')

    if (isOwnProfile) {
      setProfile({
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        bio: currentUser.bio,
        avatarUrl: currentUser.avatarUrl,
        accountType: currentUser.accountType,
        experiencePoints: currentUser.experiencePoints,
        level: currentUser.level,
      })
      setContactStatus('self')
      setLoading(false)
      return
    }

    const [
      { data: userRow, error: userError },
      { data: skillsData },
      { data: badgesData },
      { data: contactRow },
      { data: pendingSent },
      { data: pendingReceived },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('id, first_name, last_name, bio, avatar_url, account_type, experience_points, level')
        .eq('id', profileUserId)
        .single(),
      supabase
        .from('user_skills')
        .select('role, level, skills(name)')
        .eq('user_id', profileUserId)
        .order('created_at', { ascending: false }),
      supabase
        .from('user_badges')
        .select('unlocked_at, badges(title, description)')
        .eq('user_id', profileUserId)
        .order('unlocked_at', { ascending: false }),
      supabase
        .from('user_contacts')
        .select('contact_user_id')
        .eq('user_id', currentUser.id)
        .eq('contact_user_id', profileUserId)
        .maybeSingle(),
      supabase
        .from('contact_requests')
        .select('id')
        .eq('sender_user_id', currentUser.id)
        .eq('receiver_user_id', profileUserId)
        .eq('status', 'pending')
        .maybeSingle(),
      supabase
        .from('contact_requests')
        .select('id')
        .eq('sender_user_id', profileUserId)
        .eq('receiver_user_id', currentUser.id)
        .eq('status', 'pending')
        .maybeSingle(),
    ])

    if (userError || !userRow) {
      setLoadError('Profil introuvable.')
      setProfile(null)
      setLoading(false)
      return
    }

    setProfile({
      id: userRow.id,
      firstName: userRow.first_name,
      lastName: userRow.last_name,
      bio: userRow.bio,
      avatarUrl: userRow.avatar_url,
      accountType: userRow.account_type,
      experiencePoints: userRow.experience_points,
      level: userRow.level,
    })

    setSkills(
      (skillsData ?? []).map((row: UserSkillRow) => {
        const skill = Array.isArray(row.skills) ? row.skills[0] : row.skills
        return {
          name: skill?.name ?? 'Compétence',
          role: row.role,
          level: row.level,
        }
      }),
    )

    setBadges(
      (badgesData ?? []).map((row: UserBadgeRow) => {
        const badge = Array.isArray(row.badges) ? row.badges[0] : row.badges
        return {
          title: badge?.title ?? 'Badge',
          description: badge?.description ?? '',
          unlockedAt: row.unlocked_at,
        }
      }),
    )

    if (contactRow) setContactStatus('contact')
    else if (pendingSent) setContactStatus('pending_sent')
    else if (pendingReceived) setContactStatus('pending_received')
    else setContactStatus('none')

    setLoading(false)
  }, [currentUser, profileUserId, isOwnProfile])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSendContactRequest() {
    setActionLoading(true)
    setActionError('')
    setActionMessage('')

    const { error } = await supabase.from('contact_requests').insert({
      sender_user_id: currentUser.id,
      receiver_user_id: profileUserId,
    })

    setActionLoading(false)

    if (error) {
      setActionError(error.message)
      return
    }

    setContactStatus('pending_sent')
    setActionMessage('Demande de contact envoyée.')
  }

  async function handleSendMessage() {
    setActionLoading(true)
    setActionError('')

    const conversationId = await findOrCreateConversation(currentUser.id, profileUserId)

    setActionLoading(false)

    if (!conversationId) {
      setActionError('Impossible d\'ouvrir la conversation.')
      return
    }

    onOpenMessages(profileUserId)
  }

  if (loading) {
    return (
      <div className="section-page">
        <div className="section-loading">
          <IonIcon iconName="reload-outline" /> Chargement du profil…
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="section-page">
        <button type="button" className="ghost-button profile-back-button" onClick={onBack}>
          <IonIcon iconName="arrow-back-outline" /> Retour
        </button>
        <div className="empty-state">
          <IonIcon iconName="person-outline" />
          <p>{loadError || 'Profil introuvable.'}</p>
        </div>
      </div>
    )
  }

  const initials = profile.firstName.charAt(0).toUpperCase() + profile.lastName.charAt(0).toUpperCase()
  const { xpCurrent, xpNeeded, percent } = xpProgress(profile.experiencePoints, profile.level)

  return (
    <div className="section-page">
      <button type="button" className="ghost-button profile-back-button" onClick={onBack}>
        <IonIcon iconName="arrow-back-outline" /> Retour
      </button>

      <div className="section-page-header">
        <div>
          <h1>{profile.firstName} {profile.lastName}</h1>
          <p className="section-page-subtitle">Profil public SkillSwap</p>
        </div>
        {!isOwnProfile && (
          <div className="profile-actions">
            <button
              type="button"
              className="primary-button"
              disabled={actionLoading}
              onClick={handleSendMessage}
            >
              <IonIcon iconName="chatbox-outline" />
              Message
            </button>
            {contactStatus === 'none' && (
              <button
                type="button"
                className="ghost-button"
                disabled={actionLoading}
                onClick={handleSendContactRequest}
              >
                <IonIcon iconName="person-add-outline" />
                Ajouter en contact
              </button>
            )}
            {contactStatus === 'pending_sent' && (
              <span className="profile-status-pill pending">
                <IonIcon iconName="time-outline" /> Demande envoyée
              </span>
            )}
            {contactStatus === 'pending_received' && (
              <span className="profile-status-pill pending">
                <IonIcon iconName="mail-outline" /> Demande reçue — voir Notifications
              </span>
            )}
            {contactStatus === 'contact' && (
              <span className="profile-status-pill contact">
                <IonIcon iconName="checkmark-circle-outline" /> Contact
              </span>
            )}
          </div>
        )}
        {isOwnProfile && (
          <button type="button" className="primary-button" onClick={onOpenOwnProfile}>
            <IonIcon iconName="create-outline" /> Modifier mon profil
          </button>
        )}
      </div>

      {actionError && <p className="auth-feedback auth-feedback-error">{actionError}</p>}
      {actionMessage && <p className="auth-feedback auth-feedback-success">{actionMessage}</p>}

      <div className="profile-layout">
        <aside className="profile-card-large dashboard-card">
          {profile.avatarUrl ? (
            <img
              className="profile-avatar-xl"
              src={profile.avatarUrl}
              alt={`${profile.firstName} ${profile.lastName}`}
            />
          ) : (
            <div className="profile-avatar-xl profile-avatar-initials">{initials}</div>
          )}
          <h2>{profile.firstName} {profile.lastName}</h2>
          <span className="level-pill">
            <IonIcon iconName="shield-checkmark-outline" />
            Niveau {profile.level} — {profile.accountType}
          </span>
          <div className="xp-bar-section">
            <div className="xp-label">
              <span>{xpCurrent} / {xpNeeded} XP</span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="progress-track">
              <span style={{ width: `${percent}%` }} />
            </div>
          </div>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        </aside>

        <div className="profile-main">
          <section className="dashboard-card">
            <div className="card-title"><h2>Compétences</h2></div>
            {skills.length === 0 ? (
              <p className="profile-empty-copy">Aucune compétence renseignée pour l'instant.</p>
            ) : (
              <ul className="skill-list">
                {skills.map((skill) => (
                  <li key={`${skill.name}-${skill.role}`}>
                    <span className="skill-icon-wrap">
                      <IonIcon iconName={skill.role === 'Enseignant' ? 'school-outline' : 'book-outline'} />
                    </span>
                    <div>
                      <strong>{skill.name}</strong>
                      <span>{skill.role} — {skill.level}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="dashboard-card">
            <div className="card-title"><h2>Badges</h2></div>
            {badges.length === 0 ? (
              <p className="profile-empty-copy">Aucun badge débloqué pour l'instant.</p>
            ) : (
              <div className="public-badges-grid">
                {badges.map((badge) => (
                  <article key={badge.title} className="public-badge-item">
                    <div className="badge-icon-wrap">
                      <IonIcon iconName={BADGE_ICONS[badge.title] ?? 'ribbon-outline'} />
                    </div>
                    <div>
                      <strong>{badge.title}</strong>
                      <p>{badge.description}</p>
                      <time>
                        Débloqué le {new Date(badge.unlockedAt).toLocaleDateString('fr-FR')}
                      </time>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
