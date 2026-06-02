import { useState } from 'react'
import { type DashboardSectionId } from '../../data/skillSwapData'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { DashboardContent } from './DashboardContent'
import { DashboardRightPanel } from './DashboardRightPanel'
import { DashboardSheets } from './DashboardSheets'

type DashboardPageProps = {
  onSignOut: () => void
}

type DashboardSheetName = 'messages' | 'notifications'

export function DashboardPage({ onSignOut }: DashboardPageProps) {
  const [activeSectionId, setActiveSectionId] = useState<DashboardSectionId>('overview')
  const [activeSheet, setActiveSheet] = useState<DashboardSheetName | null>(null)

  const showRightPanel = activeSectionId === 'overview'

  return (
    <main className="dashboard-page">
      <AppSidebar
        activeSectionId={activeSectionId}
        onSectionChange={setActiveSectionId}
        onSignOut={onSignOut}
      />
      <section className="dashboard-main">
        <AppHeader onOpenSheet={setActiveSheet} />
        <div className={`dashboard-body ${showRightPanel ? 'with-right-panel' : ''}`}>
          <DashboardContent activeSectionId={activeSectionId} />
          {showRightPanel && <DashboardRightPanel />}
        </div>
      </section>
      <DashboardSheets activeSheet={activeSheet} onClose={() => setActiveSheet(null)} />
    </main>
  )
}
