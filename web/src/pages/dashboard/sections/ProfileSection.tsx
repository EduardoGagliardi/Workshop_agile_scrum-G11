import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'
import { xpProgress } from '../../../types'

type Props = {
  user: UserProfile
  onUserUpdate: (user: UserProfile) => void
}

export function ProfileSection({ user, onUserUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(user.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const { xpCurrent, xpNeeded, percent } = xpProgress(user.experiencePoints, user.level)
  const initials = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError('')
    setSaveSuccess(false)
    setSaveLoading(true)

    const { data, error } = await supabase
      .from('users')
      .update({
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)
      .select()
      .single()

    setSaveLoading(false)

    if (error) {
      setSaveError(error.message)
    } else if (data) {
      setSaveSuccess(true)
      setEditing(false)
      onUserUpdate({
        ...user,
        bio: data.bio,
        avatarUrl: data.avatar_url,
      })
    }
  }

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Mon profil</h1>
          <p className="section-page-subtitle">Votre profil public sur SkillSwap</p>
        </div>
        <button type="button" className="primary-button" onClick={() => { setEditing(!editing); setSaveSuccess(false) }}>
          <IonIcon iconName={editing ? 'close-outline' : 'create-outline'} />
          {editing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      <div className="profile-layout">
        <aside className="profile-card-large dashboard-card">
          {user.avatarUrl ? (
            <img className="profile-avatar-xl" src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
          ) : (
            <div className="profile-avatar-xl profile-avatar-initials">{initials}</div>
          )}
          <h2>{user.firstName} {user.lastName}</h2>
          <p className="profile-email">{user.email}</p>
          <span className="level-pill">
            <IonIcon iconName="shield-checkmark-outline" />
            Niveau {user.level} — {user.accountType}
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
          {user.bio && <p className="profile-bio">{user.bio}</p>}
        </aside>

        <div className="profile-main">
          {editing ? (
            <form className="inline-form dashboard-card" onSubmit={handleSave}>
              <h2 className="inline-form-title">Modifier le profil</h2>
              <div className="form-row">
                <label>Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Parlez de vous, vos intérêts, votre parcours…"
                />
              </div>
              <div className="form-row">
                <label>URL de l'avatar</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              {saveError && <p className="auth-feedback auth-feedback-error">{saveError}</p>}
              {saveSuccess && <p className="auth-feedback auth-feedback-success">Profil mis à jour !</p>}
              <button type="submit" className="primary-button" disabled={saveLoading}>
                {saveLoading ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          ) : (
            <div className="dashboard-card">
              <div className="card-title"><h2>Informations</h2></div>
              <dl className="profile-info-list">
                <div>
                  <dt><IonIcon iconName="person-outline" /> Nom</dt>
                  <dd>{user.firstName} {user.lastName}</dd>
                </div>
                <div>
                  <dt><IonIcon iconName="mail-outline" /> Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt><IonIcon iconName="school-outline" /> Type de compte</dt>
                  <dd>{user.accountType}</dd>
                </div>
                <div>
                  <dt><IonIcon iconName="star-outline" /> Expérience</dt>
                  <dd>{user.experiencePoints} XP — Niveau {user.level}</dd>
                </div>
                {user.bio && (
                  <div>
                    <dt><IonIcon iconName="document-text-outline" /> Bio</dt>
                    <dd>{user.bio}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
