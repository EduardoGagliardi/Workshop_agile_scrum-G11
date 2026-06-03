import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type Props = {
  user: UserProfile
  onUserUpdate: (user: UserProfile) => void
}

export function SettingsSection({ user, onUserUpdate }: Props) {
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [bio, setBio] = useState(user.bio ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)

    const { data, error } = await supabase
      .from('users')
      .update({ first_name: firstName, last_name: lastName, bio: bio || null })
      .eq('id', user.id)
      .select()
      .single()

    setProfileLoading(false)

    if (error) {
      setProfileError(error.message)
    } else if (data) {
      setProfileSuccess(true)
      onUserUpdate({ ...user, firstName: data.first_name, lastName: data.last_name, bio: data.bio })
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword.length < 6) { setPasswordError('Le nouveau mot de passe doit faire au moins 6 caractères.'); return }
    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    setPasswordLoading(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
    }
  }

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Paramètres</h1>
          <p className="section-page-subtitle">Gérez vos informations de compte</p>
        </div>
      </div>

      <div className="settings-layout">
        <form className="dashboard-card settings-group" onSubmit={handleProfileSave}>
          <div className="settings-group-header">
            <IonIcon iconName="person-circle-outline" />
            <h2>Informations du profil</h2>
          </div>

          <div className="form-grid-2">
            <div className="form-row">
              <label>Prénom</label>
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="form-row">
              <label>Nom</label>
              <input required value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <label>Adresse email</label>
            <input type="email" value={user.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>L'email ne peut pas être modifié ici.</small>
          </div>

          <div className="form-row">
            <label>Bio</label>
            <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Parlez de vous…" />
          </div>

          {profileError && <p className="auth-feedback auth-feedback-error">{profileError}</p>}
          {profileSuccess && <p className="auth-feedback auth-feedback-success">Profil mis à jour !</p>}

          <button type="submit" className="primary-button" disabled={profileLoading}>
            {profileLoading ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>

        <form className="dashboard-card settings-group" onSubmit={handlePasswordChange}>
          <div className="settings-group-header">
            <IonIcon iconName="lock-closed-outline" />
            <h2>Mot de passe</h2>
          </div>

          <div className="form-row">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Au moins 6 caractères"
              autoComplete="new-password"
            />
          </div>

          {passwordError && <p className="auth-feedback auth-feedback-error">{passwordError}</p>}
          {passwordSuccess && <p className="auth-feedback auth-feedback-success">Mot de passe mis à jour !</p>}

          <button type="submit" className="primary-button" disabled={passwordLoading}>
            {passwordLoading ? 'Mise à jour…' : 'Changer le mot de passe'}
          </button>
        </form>

        <div className="dashboard-card settings-group">
          <div className="settings-group-header">
            <IonIcon iconName="information-circle-outline" />
            <h2>Compte</h2>
          </div>
          <dl className="profile-info-list">
            <div>
              <dt>Type de compte</dt>
              <dd>{user.accountType}</dd>
            </div>
            <div>
              <dt>Niveau</dt>
              <dd>{user.level}</dd>
            </div>
            <div>
              <dt>XP total</dt>
              <dd>{user.experiencePoints}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
