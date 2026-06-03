import { type FormEvent, useState } from 'react'
import logo from '../../assets/logo.png'
import { supabase } from '../../lib/supabaseClient'
import { IonIcon } from '../../shared/IonIcon'

type AuthMode = 'sign-in' | 'sign-up'

type AuthPageProps = {
  authMode: AuthMode
  onNavigate: (view: 'landing' | AuthMode | 'dashboard') => void
  onAuthenticate: () => void
}

const brandStats = [
  { icon: 'people-outline', value: '1 200+', label: 'Étudiants actifs' },
  { icon: 'school-outline', value: '350+', label: 'Compétences disponibles' },
  { icon: 'bar-chart-outline', value: '800+', label: 'Sessions réalisées' },
]

export function AuthPage({ authMode, onNavigate, onAuthenticate }: AuthPageProps) {
  const isSignIn = authMode === 'sign-in'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState<string | null>(null)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!email || !password) {
      setAuthError('Veuillez renseigner votre email et votre mot de passe.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          setAuthError(error.message)
          return
        }
        onAuthenticate()
        return
      }

      const firstName = String(formData.get('firstName') ?? '').trim()
      const lastName = String(formData.get('lastName') ?? '').trim()

      if (!firstName || !lastName) {
        setAuthError('Veuillez renseigner votre prénom et votre nom.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (error) {
        setAuthError(error.message)
        return
      }

      if (data.session) {
        onAuthenticate()
        return
      }

      setAuthSuccess(
        'Compte créé. Vérifiez votre boîte mail pour confirmer votre inscription, puis connectez-vous.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAuthError(null)
    setAuthSuccess(null)
    setForgotLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}`,
    })
    setForgotLoading(false)
    if (error) {
      setAuthError(error.message)
    } else {
      setAuthSuccess('Un lien de réinitialisation a été envoyé à votre adresse email.')
      setForgotMode(false)
    }
  }

  return (
    <div className="auth-layout">
      <aside className="auth-brand-panel">
        <button
          type="button"
          className="auth-back-button"
          onClick={() => onNavigate('landing')}
        >
          <IonIcon iconName="arrow-back-outline" />
          Retour
        </button>

        <div className="auth-brand-content">
          <span className="brand-name auth-brand-name">
            <img src={logo} alt="" className="brand-logo" aria-hidden="true" />
            SkillSwap
          </span>

          <h2 className="auth-brand-headline">
            Apprenez, enseignez et{' '}
            <span className="auth-brand-accent">progressez ensemble.</span>
          </h2>

          <p className="auth-brand-desc">
            La plateforme étudiante pour échanger des compétences, gagner de l'XP et bâtir une
            communauté d'apprentissage active.
          </p>

          <div className="auth-stats-row">
            {brandStats.map((stat) => (
              <div key={stat.label} className="auth-stat-item">
                <IonIcon iconName={stat.icon} />
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <blockquote className="auth-testimonial-card">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=48&q=80"
              alt="Sarah M."
              className="auth-testimonial-avatar"
            />
            <div>
              <p className="auth-testimonial-text">
                "SkillSwap m'a permis de trouver un mentor en React en moins d'une heure.
                Incroyable !"
              </p>
              <cite className="auth-testimonial-author">
                Sarah M. — Étudiante en Informatique
              </cite>
            </div>
          </blockquote>
        </div>
      </aside>

      <main className="auth-form-panel">
        <div className="auth-form-container">
          <p className="community-pill">
            <IonIcon iconName={isSignIn ? 'lock-closed-outline' : 'sparkles-outline'} />
            {isSignIn ? 'Bon retour parmi nous' : 'Rejoindre la communauté'}
          </p>

          <h1 className="auth-form-title">
            {isSignIn ? 'Connexion à SkillSwap' : 'Créer votre compte'}
          </h1>

          <p className="auth-form-subtitle">
            {isSignIn
              ? 'Accédez à votre tableau de bord, vos sessions, messages et bien plus.'
              : "Créez votre profil, listez vos compétences et commencez à gagner de l'XP."}
          </p>

          {authError && (
            <p className="auth-feedback auth-feedback-error" role="alert">
              {authError}
            </p>
          )}
          {authSuccess && (
            <p className="auth-feedback auth-feedback-success" role="status">
              {authSuccess}
            </p>
          )}

          {forgotMode ? (
            <form className="auth-form" onSubmit={handleForgotPassword}>
              <div className="form-row">
                <label htmlFor="forgot-email">Email académique</label>
                <div className="input-icon-wrap">
                  <IonIcon iconName="mail-outline" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="sarah.martin@campus.fr"
                    disabled={forgotLoading}
                  />
                </div>
              </div>
              <button type="submit" className="primary-button full-width auth-submit-button" disabled={forgotLoading}>
                {forgotLoading ? 'Envoi…' : 'Envoyer le lien'}
                {!forgotLoading && <IonIcon iconName="arrow-forward-outline" />}
              </button>
              <button
                type="button"
                className="text-button"
                style={{ textAlign: 'center' }}
                onClick={() => { setForgotMode(false); setAuthError(null) }}
              >
                ← Retour à la connexion
              </button>
            </form>
          ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {!isSignIn && (
              <div className="form-row-duo">
                <div className="form-row">
                  <label htmlFor="firstName">Prénom</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Sarah"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="lastName">Nom</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Martin"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <label htmlFor="email">Email académique</label>
              <div className="input-icon-wrap">
                <IonIcon iconName="mail-outline" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sarah.martin@campus.fr"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-label-row">
                <label htmlFor="password">Mot de passe</label>
                {isSignIn && (
                  <button
                    type="button"
                    className="text-button auth-forgot-link"
                    onClick={() => { setForgotMode(true); setAuthError(null); setAuthSuccess(null) }}
                  >
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div className="input-icon-wrap">
                <IonIcon iconName="lock-closed-outline" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-button full-width auth-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Chargement…'
                : isSignIn
                  ? 'Se connecter'
                  : 'Créer mon compte'}
              {!isSubmitting && <IonIcon iconName="arrow-forward-outline" />}
            </button>
          </form>
          )}

          {!forgotMode && (
          <p className="auth-switch">
            {isSignIn ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setAuthError(null)
                setAuthSuccess(null)
                onNavigate(isSignIn ? 'sign-up' : 'sign-in')
              }}
            >
              {isSignIn ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
          )}
        </div>
      </main>
    </div>
  )
}
