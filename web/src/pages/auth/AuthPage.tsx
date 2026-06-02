import { IonIcon } from '../../shared/IonIcon'

type AuthMode = 'sign-in' | 'sign-up'

type AuthPageProps = {
  authMode: AuthMode
  onNavigate: (view: 'landing' | AuthMode | 'dashboard') => void
  onAuthenticate: () => void
}

export function AuthPage({ authMode, onNavigate, onAuthenticate }: AuthPageProps) {
  const isSignUp = authMode === 'sign-up'

  return (
    <main className="auth-page">
      <button type="button" className="back-link" onClick={() => onNavigate('landing')}>
        <IonIcon iconName="arrow-back-outline" />
        Back to landing page
      </button>

      <section className="auth-card">
        <div className="auth-copy">
          <p className="community-pill">
            <IonIcon iconName={isSignUp ? 'sparkles-outline' : 'lock-closed-outline'} />
            {isSignUp ? 'Join the campus network' : 'Welcome back'}
          </p>
          <h1>{isSignUp ? 'Create your SkillSwap account.' : 'Sign in to SkillSwap.'}</h1>
          <p>
            {isSignUp
              ? 'Build your profile, list the skills you teach or want to learn, and start earning XP from your first session.'
              : 'Access your dashboard, upcoming sessions, messages, notifications, skills, badges, and friend invitations.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
          {isSignUp && (
            <div className="form-row">
              <label htmlFor="firstName">First name</label>
              <input id="firstName" name="firstName" type="text" placeholder="Sarah" />
            </div>
          )}
          {isSignUp && (
            <div className="form-row">
              <label htmlFor="lastName">Last name</label>
              <input id="lastName" name="lastName" type="text" placeholder="Martin" />
            </div>
          )}
          <div className="form-row">
            <label htmlFor="email">Academic email</label>
            <input id="email" name="email" type="email" placeholder="sarah.martin@campus.fr" />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="********" />
          </div>
          {isSignUp && (
            <div className="form-row">
              <label htmlFor="accountType">Account type</label>
              <select id="accountType" name="accountType" defaultValue="student">
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
              </select>
            </div>
          )}

          <button type="button" className="primary-button full-width" onClick={onAuthenticate}>
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <p className="auth-switch">
            {isSignUp ? 'Already have an account?' : 'No account yet?'}
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate(isSignUp ? 'sign-in' : 'sign-up')}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}
