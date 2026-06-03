import { useEffect, useState } from 'react'
import './App.css'
import { AuthPage } from './pages/auth/AuthPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { LandingPage } from './pages/landing/LandingPage'
import { supabase } from './lib/supabaseClient'
import type { UserProfile } from './types'
import type { User } from '@supabase/supabase-js'

type AppView = 'landing' | 'sign-in' | 'sign-up' | 'dashboard'

async function loadOrCreateUser(authUser: User): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (data) {
    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      accountType: data.account_type,
      experiencePoints: data.experience_points,
      level: data.level,
    }
  }

  // No row yet — create from auth metadata
  if (error?.code === 'PGRST116') {
    const meta = authUser.user_metadata ?? {}
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        first_name: meta.first_name ?? '',
        last_name: meta.last_name ?? '',
        email: authUser.email ?? '',
        account_type: 'Étudiant',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Impossible de créer le profil:', insertError)
      return null
    }

    if (newUser) {
      return {
        id: newUser.id,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        email: newUser.email,
        bio: newUser.bio,
        avatarUrl: newUser.avatar_url,
        accountType: newUser.account_type,
        experiencePoints: newUser.experience_points,
        level: newUser.level,
      }
    }
  }

  return null
}

function App() {
  const [activeView, setActiveView] = useState<AppView>('landing')
  const [isSessionLoading, setIsSessionLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const profile = await loadOrCreateUser(session.user)
        setUser(profile)
        setActiveView('dashboard')
      }
      setIsSessionLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const profile = await loadOrCreateUser(session.user)
        setUser(profile)
        setActiveView('dashboard')
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setActiveView('landing')
  }

  if (isSessionLoading) {
    return (
      <main className="auth-form-panel" style={{ minHeight: '100vh' }}>
        <p className="auth-form-subtitle">Chargement…</p>
      </main>
    )
  }

  if (activeView === 'dashboard' && user) {
    return <DashboardPage user={user} onUserUpdate={setUser} onSignOut={handleSignOut} />
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
