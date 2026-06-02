import { messages, notifications } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'

type DashboardSheetName = 'messages' | 'notifications'

type DashboardSheetsProps = {
  activeSheet: DashboardSheetName | null
  onClose: () => void
}

export function DashboardSheets({ activeSheet, onClose }: DashboardSheetsProps) {
  if (!activeSheet) {
    return null
  }

  const isMessageSheet = activeSheet === 'messages'

  return (
    <div className="sheet-overlay" role="presentation" onClick={onClose}>
      <aside className="dashboard-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <div>
            <span>{isMessageSheet ? 'Inbox' : 'Updates'}</span>
            <h2>{isMessageSheet ? 'Messages' : 'Notifications'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close sheet" onClick={onClose}>
            <IonIcon iconName="close-outline" />
          </button>
        </div>

        <div className="sheet-list">
          {isMessageSheet
            ? messages.map((message) => (
                <article key={`${message.senderName}-${message.time}`}>
                  <strong>{message.senderName}</strong>
                  <p>{message.preview}</p>
                  <span>{message.time}</span>
                </article>
              ))
            : notifications.map((notification) => (
                <article key={notification}>
                  <strong>Notification</strong>
                  <p>{notification}</p>
                </article>
              ))}
        </div>
      </aside>
    </div>
  )
}
