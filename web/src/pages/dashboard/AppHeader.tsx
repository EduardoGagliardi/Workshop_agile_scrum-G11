import { IonIcon } from '../../shared/IonIcon'
import { ThemeToggleButton } from '../../shared/ThemeToggleButton'
import type { UserProfile } from '../../types'

type AppHeaderProps = {
  user: UserProfile
  unreadMessageCount: number
  notificationCount: number
  onOpenSheet: (sheetName: 'messages' | 'notifications') => void
}

export function AppHeader({
  user,
  unreadMessageCount,
  notificationCount,
  onOpenSheet,
}: AppHeaderProps) {
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
        <ThemeToggleButton />
        <button
          type="button"
          className="icon-button"
          aria-label={`Ouvrir les notifications${notificationCount > 0 ? `, ${notificationCount} nouvelle${notificationCount > 1 ? 's' : ''}` : ''}`}
          onClick={() => onOpenSheet('notifications')}
        >
          <IonIcon iconName="notifications-outline" />
          {notificationCount > 0 && (
            <span aria-hidden="true">{notificationCount > 9 ? '9+' : notificationCount}</span>
          )}
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label={`Ouvrir les messages${unreadMessageCount > 0 ? `, ${unreadMessageCount} non lu${unreadMessageCount > 1 ? 's' : ''}` : ''}`}
          onClick={() => onOpenSheet('messages')}
        >
          <IonIcon iconName="chatbox-ellipses-outline" />
          {unreadMessageCount > 0 && (
            <span aria-hidden="true">{unreadMessageCount > 9 ? '9+' : unreadMessageCount}</span>
          )}
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
