import {
  badges,
  currentUser,
  messages,
  notifications,
  popularSkills,
  recentActivities,
  upcomingSessions,
  type DashboardSectionId,
} from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'

type DashboardContentProps = {
  activeSectionId: DashboardSectionId
}

export function DashboardContent({ activeSectionId }: DashboardContentProps) {
  if (activeSectionId !== 'overview') {
    return <FeatureSection activeSectionId={activeSectionId} />
  }

  return (
    <div className="dashboard-center">
      <section className="dashboard-card welcome-card">
        <div>
          <h1>Bonjour {currentUser.firstName} ! 👋</h1>
          <p>Prête à apprendre et à partager aujourd'hui ?</p>
        </div>
        <button type="button" className="primary-button">
          <IonIcon iconName="add-outline" />
          Créer une session
        </button>
      </section>

      <section className="dashboard-card sessions-card">
        <CardTitle title="Mes prochaines sessions" actionLabel="Voir tout" />
        <div className="session-list">
          {upcomingSessions.map((session) => (
            <article key={session.title} className="session-item">
              <span className={`session-icon ${session.accentClassName}`}>{session.iconText}</span>
              <div className="session-info">
                <h3>{session.title}</h3>
                <p>Avec {session.hostName}</p>
              </div>
              <div className="session-meta">
                <span>
                  <IonIcon iconName="calendar-outline" />
                  {session.date}
                </span>
                <span>
                  <IonIcon iconName="time-outline" />
                  {session.time}
                </span>
              </div>
              <div className="session-participants">
                <span className="participant-count">{session.participantsCount}</span>
                <small>participants</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-card progress-card">
        <CardTitle title="Ma progression" actionLabel="Voir tout" />
        <div className="progress-summary">
          <div className="progress-ring-wrap">
            <svg viewBox="0 0 86 86" className="progress-ring-svg" aria-hidden="true">
              <circle cx="43" cy="43" r="35" className="progress-ring-track" />
              <circle
                cx="43"
                cy="43"
                r="35"
                className="progress-ring-fill"
                strokeDasharray={`${2 * Math.PI * 35}`}
                strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
              />
            </svg>
            <span className="progress-ring-label">75%</span>
          </div>
          <div className="progress-details">
            <p>Objectif du mois</p>
            <strong>Animer 5 sessions</strong>
            <span>3 / 5 sessions</span>
          </div>
        </div>
      </section>

      <div className="dashboard-bottom-grid">
        <section className="dashboard-card">
          <CardTitle title="Activité récente" actionLabel="Voir tout" />
          <ul className="activity-list">
            {recentActivities.map((activity) => (
              <li key={activity}>
                <span className="activity-dot" />
                {activity}
              </li>
            ))}
          </ul>
        </section>

        <section className="dashboard-card">
          <CardTitle title="Messages" actionLabel="Voir tout" />
          <ul className="message-list">
            {messages.slice(0, 4).map((message) => (
              <li key={`${message.senderName}-${message.time}`}>
                <div className="message-sender-avatar">
                  {message.senderName.charAt(0)}
                </div>
                <div className="message-body">
                  <strong>{message.senderName}</strong>
                  <span>{message.preview}</span>
                </div>
                <em>{message.time}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function FeatureSection({ activeSectionId }: DashboardContentProps) {
  const sectionContent: Record<DashboardSectionId, { title: string; description: string }> = {
    overview: {
      title: 'Tableau de bord',
      description: 'Vue d\'ensemble de votre progression, sessions, compétences et recommandations.',
    },
    search: {
      title: 'Recherche',
      description: 'Recherchez par compétence, session ou profil étudiant depuis un seul endroit.',
    },
    sessions: {
      title: 'Mes sessions',
      description: 'Gérez les sessions que vous animez, celles auxquelles vous participez et vos réservations.',
    },
    skills: {
      title: 'Mes compétences',
      description: 'Suivez les compétences que vous enseignez, celles que vous apprenez et votre niveau.',
    },
    messages: {
      title: 'Messages',
      description: 'Continuez vos conversations privées avec vos contacts.',
    },
    notifications: {
      title: 'Notifications',
      description: 'Suivez les invitations, mises à jour de sessions, nouveaux messages et badges.',
    },
    feed: {
      title: 'Feed social',
      description: 'Partagez des publications, ressources, notes de projet et retours entre pairs.',
    },
    badges: {
      title: 'Badges',
      description: 'Affichez les récompenses débloquées grâce aux sessions, au mentorat et à la participation.',
    },
    settings: {
      title: 'Paramètres',
      description: 'Mettez à jour vos préférences de profil, informations de compte et notifications.',
    },
    friends: {
      title: 'Mon profil',
      description: 'Gérez votre profil public, vos compétences et vos disponibilités.',
    },
  }

  if (activeSectionId === 'notifications') {
    return (
      <section className="dashboard-card feature-card">
        <CardTitle title="Notifications" actionLabel="Tout marquer comme lu" />
        <div className="feature-preview">
          {notifications.map((notification) => (
            <span key={notification}>
              <IonIcon iconName="notifications-outline" />
              {notification}
            </span>
          ))}
        </div>
      </section>
    )
  }

  if (activeSectionId === 'badges') {
    return (
      <section className="dashboard-card feature-card">
        <CardTitle title="Badges" actionLabel="Voir tout" />
        <div className="feature-preview">
          {badges.map((badge) => (
            <span key={badge.title}>
              <IonIcon iconName={badge.iconName} />
              {badge.title} — Niveau {badge.level}
            </span>
          ))}
        </div>
      </section>
    )
  }

  if (activeSectionId === 'search') {
    return (
      <section className="dashboard-card feature-card">
        <CardTitle title="Recherche de compétences" actionLabel="Filtrer" />
        <p className="feature-subtitle">Trouvez l'étudiant qui peut vous aider à apprendre ou à progresser</p>
        <div className="feature-preview">
          {popularSkills.map((skill) => (
            <span key={skill.name}>
              <IonIcon iconName={skill.iconName} />
              {skill.name} — {skill.studentsCount} étudiants
            </span>
          ))}
        </div>
      </section>
    )
  }

  if (activeSectionId === 'friends') {
    return (
      <section className="dashboard-card feature-card">
        <CardTitle title="Mon profil" actionLabel="Éditer le profil" />
        <div className="profile-feature-card">
          <img
            className="profile-avatar large"
            src={currentUser.avatarUrl}
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
          />
          <div>
            <h2>{currentUser.firstName} {currentUser.lastName}</h2>
            <p>{currentUser.field}</p>
            <span className="level-pill">
              <IonIcon iconName="shield-checkmark-outline" />
              Niveau {currentUser.level}
            </span>
          </div>
        </div>
        <div className="feature-preview" style={{ marginTop: '1rem' }}>
          {badges.map((badge) => (
            <span key={badge.title}>
              <IonIcon iconName={badge.iconName} />
              {badge.title} — Niveau {badge.level}
            </span>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="dashboard-card feature-card">
      <CardTitle title={sectionContent[activeSectionId].title} actionLabel="Ouvrir" />
      <p className="feature-subtitle">{sectionContent[activeSectionId].description}</p>
      <div className="feature-preview">
        {upcomingSessions.map((session) => (
          <span key={session.title}>
            <span className={`session-icon ${session.accentClassName}`}>{session.iconText}</span>
            {session.title}
          </span>
        ))}
      </div>
    </section>
  )
}

function CardTitle({ title, actionLabel }: { title: string; actionLabel: string }) {
  return (
    <div className="card-title">
      <h2>{title}</h2>
      <button type="button">{actionLabel}</button>
    </div>
  )
}
