import { useState } from 'react'
import { type DashboardSectionId } from '../../data/skillSwapData'
import { useDashboardAlerts } from '../../hooks/useDashboardAlerts'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { DashboardContent } from './DashboardContent'
import { DashboardRightPanel } from './DashboardRightPanel'
import { DashboardSheets } from './DashboardSheets'
import type { UserProfile } from '../../types'

type DashboardPageProps = {
  user: UserProfile
  onUserUpdate: (user: UserProfile) => void
  onSignOut: () => void
}

type DashboardSheetName = 'messages' | 'notifications'

export function DashboardPage({ user, onUserUpdate, onSignOut }: DashboardPageProps) {
  const [activeSectionId, setActiveSectionId] = useState<DashboardSectionId>('overview')
  const [activeSheet, setActiveSheet] = useState<DashboardSheetName | null>(null)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null)
  const {
    messagePreviews,
    notificationPreviews,
    unreadMessageCount,
    notificationCount,
    refresh: refreshAlerts,
  } = useDashboardAlerts(user.id)

  const showRightPanel = activeSectionId === 'overview'

  function openMessagesSection() {
    setActiveSheet(null)
    setActiveSectionId('messages')
    refreshAlerts()
  }

  function openNotificationsSection() {
    setActiveSheet(null)
    setActiveSectionId('notifications')
    refreshAlerts()
  }

  function handleViewProfile(userId: string) {
    setViewingUserId(userId)
  }

  function handleCloseProfile() {
    setViewingUserId(null)
  }

  function handleOpenOwnProfile() {
    setViewingUserId(null)
    setActiveSectionId('friends')
  }

  function handleOpenMessages(targetUserId: string) {
    setViewingUserId(null)
    setMessageTargetUserId(targetUserId)
    setActiveSectionId('messages')
    refreshAlerts()
  }

  function handleSectionChange(sectionId: DashboardSectionId) {
    setViewingUserId(null)
    setActiveSectionId(sectionId)
  }

  return (
    <main className="dashboard-page">
      <AppSidebar
        user={user}
        activeSectionId={activeSectionId}
        onSectionChange={handleSectionChange}
        onSignOut={onSignOut}
        unreadMessageCount={unreadMessageCount}
        notificationCount={notificationCount}
      />
      <section className="dashboard-main">
        <AppHeader
          user={user}
          unreadMessageCount={unreadMessageCount}
          notificationCount={notificationCount}
          onOpenSheet={setActiveSheet}
        />
        <div className={`dashboard-body ${showRightPanel ? 'with-right-panel' : ''}`}>
          <DashboardContent
            user={user}
            onUserUpdate={onUserUpdate}
            activeSectionId={activeSectionId}
            viewingUserId={viewingUserId}
            messageTargetUserId={messageTargetUserId}
            onNavigate={handleSectionChange}
            onViewProfile={handleViewProfile}
            onCloseProfile={handleCloseProfile}
            onOpenOwnProfile={handleOpenOwnProfile}
            onOpenMessages={handleOpenMessages}
            onClearMessageTarget={() => setMessageTargetUserId(null)}
          />
          {showRightPanel && <DashboardRightPanel />}
        </div>
      </section>
      <DashboardSheets
        activeSheet={activeSheet}
        messagePreviews={messagePreviews}
        notificationPreviews={notificationPreviews}
        onClose={() => setActiveSheet(null)}
        onOpenMessages={openMessagesSection}
        onOpenNotifications={openNotificationsSection}
      />
    </main>
  )
}
