import heroImage from '../../assets/hero.png'
import logo from '../../assets/logo.png'
import { IonIcon } from '../../shared/IonIcon'

type LandingPageProps = {
  onNavigate: (view: 'landing' | 'sign-in' | 'sign-up' | 'dashboard') => void
}

const landingLinks = [
  { label: 'Accueil', href: '#home' },
  { label: 'Découvrir', href: '#discover' },
  { label: 'Comment ça marche', href: '#how-it-works' },
  { label: 'À propos', href: '#about' },
  { label: 'Blog', href: '#blog' },
]

const howItWorksSteps = [
  {
    icon: 'person-add-outline',
    title: '1. Créez votre profil',
    description: 'Inscrivez-vous et ajoutez vos compétences et intérêts.',
  },
  {
    icon: 'search-outline',
    title: '2. Trouvez une compétence',
    description: 'Recherchez parmi des centaines de compétences proposées par la communauté.',
  },
  {
    icon: 'calendar-outline',
    title: '3. Organisez une session',
    description: 'Planifiez une session en ligne ou en présentiel selon vos disponibilités.',
  },
  {
    icon: 'trophy-outline',
    title: '4. Progressez ensemble',
    description: 'Apprenez, partagez et gagnez des badges en participant activement.',
  },
]

const platformStats = [
  { value: '1200+', label: 'Étudiants actifs' },
  { value: '350+', label: 'Compétences disponibles' },
  { value: '800+', label: 'Sessions réalisées' },
  { value: '95%', label: 'Étudiants satisfaits' },
]

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <main className="landing-page">
      <header className="top-nav">
        <a href="#home" className="brand-name" aria-label="SkillSwap home">
          <img src={logo} alt="" className="brand-logo" aria-hidden="true" />
          SkillSwap
        </a>
        <nav className="nav-links" aria-label="Navigation principale">
          {landingLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="help-button" aria-label="Aide">
            <IonIcon iconName="help-outline" />
          </button>
          <button type="button" className="ghost-button" onClick={() => onNavigate('sign-in')}>
            Connexion
          </button>
          <button type="button" className="accent-button" onClick={() => onNavigate('sign-up')}>
            S'inscrire
          </button>
        </div>
      </header>

      <section className="hero-layout" id="home">
        <div className="hero-left">
          <p className="community-pill">
            <IonIcon iconName="people-circle-outline" />
            La communauté étudiante #1 pour apprendre et partager
          </p>
          <h1>
            Échangez vos <span className="hero-accent">compétences</span> entre étudiants
          </h1>
          <p className="hero-description">
            SkillSwap vous permet d'apprendre, d'enseigner et de collaborer avec des étudiants qui
            partagent les mêmes passions que vous.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => onNavigate('sign-up')}>
              <IonIcon iconName="search-outline" />
              Trouver une compétence
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => onNavigate('sign-up')}
            >
              <IonIcon iconName="person-add-outline" />
              Proposer une compétence
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="social-proof-avatars">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80"
                alt="Étudiante"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&q=80"
                alt="Étudiant"
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=40&q=80"
                alt="Étudiante"
              />
            </div>
            <p>
              Rejoignez plus de <strong>1 200 étudiants</strong> et commencez dès aujourd'hui !
            </p>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-card">
            <img src={heroImage} alt="Étudiants qui collaborent" className="hero-photo" />

            <div className="floating-card top-left mentor-card">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=40&q=80"
                alt="Sarah M."
                className="float-avatar"
              />
              <div className="float-info">
                <div className="float-name-row">
                  <strong>Sarah M.</strong>
                  <span className="role-badge mentor">Mentor</span>
                </div>
                <span className="float-skill">Développement Web</span>
                <span className="float-rating">⭐ 5.0 (24 avis)</span>
              </div>
            </div>

            <div className="floating-card top-right sessions-card-float">
              <IonIcon iconName="bar-chart-outline" />
              <div>
                <small>Sessions réalisées</small>
                <strong>800+</strong>
                <span className="growth-tag">+12%</span>
                <small>ce mois-ci</small>
              </div>
            </div>

            <div className="floating-card bottom-left skills-card-float">
              <IonIcon iconName="school-outline" />
              <div>
                <small>Compétences disponibles</small>
                <strong>350+ <span className="growth-tag">+8%</span></strong>
                <small>dans tous les domaines</small>
              </div>
            </div>

            <div className="floating-card bottom-right learner-card">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&q=80"
                alt="Thomas L."
                className="float-avatar"
              />
              <div className="float-info">
                <div className="float-name-row">
                  <strong>Thomas L.</strong>
                  <span className="role-badge learner">Apprenant</span>
                </div>
                <span className="float-skill">Design UI/UX</span>
                <span className="float-rating">⭐ 4.8 (18 avis)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works-section" id="how-it-works">
        <div className="how-it-works-card">
          <h2>Comment ça marche ?</h2>
          <div className="steps-row">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="step-item">
                <div className="step-icon-wrap">
                  <IonIcon iconName={step.icon} />
                </div>
                {index < howItWorksSteps.length - 1 && (
                  <div className="step-arrow" aria-hidden="true" />
                )}
                <p className="step-title">{step.title}</p>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="blue-stats-card">
          <span className="section-eyebrow">Plateforme</span>
          <h2>SkillSwap en chiffres</h2>
          <div className="metrics-grid">
            {platformStats.map((stat) => (
              <div key={stat.label} className="metric-item">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-grid" id="discover">
        <article className="white-card" id="about">
          <span className="section-eyebrow">À propos</span>
          <h2>Un espace d'apprentissage entre pairs.</h2>
          <p>
            Les étudiants peuvent être apprenants, mentors, ou les deux à la fois. Chaque session,
            message, badge et point XP renforce une communauté d'apprentissage active.
          </p>
        </article>
        <article className="white-card" id="blog">
          <span className="section-eyebrow">Blog</span>
          <h2>Des histoires de la communauté.</h2>
          <p>
            Partagez des guides, des notes de projet et des retours d'expérience pour aider
            d'autres étudiants à trouver de nouvelles façons de progresser.
          </p>
        </article>
      </section>
    </main>
  )
}
