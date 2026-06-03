import { IonIcon } from '../../shared/IonIcon'
import type { MessagePreview, NotificationPreview } from '../../hooks/useDashboardAlerts'

type DashboardSheetName = 'messages' | 'notifications'

type DashboardSheetsProps = {
  activeSheet: DashboardSheetName | null
  messagePreviews: MessagePreview[]
  notificationPreviews: NotificationPreview[]
  onClose: () => void
  onOpenMessages: () => void
  onOpenNotifications: () => void
}

function formatPreviewTime(iso: string) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function DashboardSheets({
  activeSheet,
  messagePreviews,
  notificationPreviews,
  onClose,
  onOpenMessages,
  onOpenNotifications,
}: DashboardSheetsProps) {
  if (!activeSheet) {
    return null
  }

  const isMessageSheet = activeSheet === 'messages'

  return (
    <div className="sheet-overlay" role="presentation" onClick={onClose}>
      <aside className="dashboard-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="sheet-header">
          <div>
            <span>{isMessageSheet ? 'Boîte de réception' : 'Activité'}</span>
            <h2>{isMessageSheet ? 'Messages' : 'Notifications'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Fermer le panneau" onClick={onClose}>
            <IonIcon iconName="close-outline" />
          </button>
        </div>

        <div className="sheet-list">
          {isMessageSheet ? (
            messagePreviews.length === 0 ? (
              <p className="sheet-empty">Aucun message pour l'instant.</p>
            ) : (
              messagePreviews.map((message) => (
                <article key={message.conversationId}>
                  <strong>{message.senderName}</strong>
                  <p>{message.preview}</p>
                  <span>{formatPreviewTime(message.time)}</span>
                </article>
              ))
            )
          ) : notificationPreviews.length === 0 ? (
            <p className="sheet-empty">Aucune notification pour l'instant.</p>
          ) : (
            notificationPreviews.map((notification) => (
              <article key={notification.id}>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
                <span>{formatPreviewTime(notification.time)}</span>
              </article>
            ))
          )}
        </div>

        <div className="sheet-footer">
          <button
            type="button"
            className="primary-button"
            onClick={isMessageSheet ? onOpenMessages : onOpenNotifications}
          >
            {isMessageSheet ? 'Ouvrir les messages' : 'Voir toutes les notifications'}
          </button>
        </div>
      </aside>
    </div>
  )
}
