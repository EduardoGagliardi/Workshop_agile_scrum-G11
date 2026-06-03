import { IonIcon } from '../../shared/IonIcon'
import type { UserProfile } from '../../types'

type AppHeaderProps = {
  user: UserProfile
  onOpenSheet: (sheetName: 'messages' | 'notifications') => void
}

export function AppHeader({ user, onOpenSheet }: AppHeaderProps) {
  const initials = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()

  return (
    <header className="app-header">
      <label className="global-search">
        <IonIcon iconName="search-outline" />
        <input
          type="search"
          placeholder="Rechercher une compétence, session ou étudiant…"
          aria-label="Rechercher compétences, sessions et étudiants"
        />
      </label>

      <div className="header-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Ouvrir les notifications"
          onClick={() => onOpenSheet('notifications')}
        >
          <IonIcon iconName="notifications-outline" />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Ouvrir les messages"
          onClick={() => onOpenSheet('messages')}
        >
          <IonIcon iconName="chatbox-ellipses-outline" />
        </button>
        <article className="user-summary-card">
          {user.avatarUrl ? (
            <img
              className="profile-avatar"
              src={user.avatarUrl}
              alt={`${user.firstName} ${user.lastName}`}
            />
          ) : (
            <div className="profile-avatar profile-avatar-initials" style={{ fontSize: '0.75rem' }}>
              {initials}
            </div>
          )}
          <div>
            <strong>{user.firstName} {user.lastName}</strong>
            <span>Niveau {user.level}</span>
          </div>
          <IonIcon iconName="chevron-down-outline" />
        </article>
      </div>
    </header>
  )
}
