import { currentUser, messages, notifications } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'

type AppHeaderProps = {
  onOpenSheet: (sheetName: 'messages' | 'notifications') => void
}

export function AppHeader({ onOpenSheet }: AppHeaderProps) {
  return (
    <header className="app-header">
      <label className="global-search">
        <IonIcon iconName="search-outline" />
        <input
          type="search"
          placeholder="Search for a skill, session, or student..."
          aria-label="Search skills, sessions, and students"
        />
      </label>

      <div className="header-actions">
        <button
          type="button"
          className="icon-button"
          aria-label="Open notifications"
          onClick={() => onOpenSheet('notifications')}
        >
          <IonIcon iconName="notifications-outline" />
          <span>{notifications.length}</span>
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Open messages"
          onClick={() => onOpenSheet('messages')}
        >
          <IonIcon iconName="chatbox-ellipses-outline" />
          <span>{messages.length}</span>
        </button>
        <article className="user-summary-card">
          <img
            className="profile-avatar"
            src={currentUser.avatarUrl}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
          />
          <div>
            <strong>
              {currentUser.firstName} {currentUser.lastName}
            </strong>
            <span>Level {currentUser.level}</span>
          </div>
          <IonIcon iconName="chevron-down-outline" />
        </article>
      </div>
    </header>
  )
}
