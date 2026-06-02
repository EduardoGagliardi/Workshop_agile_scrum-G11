import { useState } from 'react'
import './App.css'
import { AuthPage } from './pages/auth/AuthPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LandingPage } from './pages/landing/LandingPage'

type AppView = 'landing' | 'sign-in' | 'sign-up' | 'dashboard'

function App() {
  const [activeView, setActiveView] = useState<AppView>('landing')

  if (activeView === 'dashboard') {
    return <DashboardPage onSignOut={() => setActiveView('landing')} />
  }

  if (activeView === 'sign-in' || activeView === 'sign-up') {
    return (
      <AuthPage
        authMode={activeView}
        onNavigate={setActiveView}
        onAuthenticate={() => setActiveView('dashboard')}
      />
    )
  }

  return <LandingPage onNavigate={setActiveView} />
}

export default App
