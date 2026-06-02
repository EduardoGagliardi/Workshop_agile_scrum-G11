import { badges, currentUser, navigationSections, type DashboardSectionId } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'

type AppSidebarProps = {
  activeSectionId: DashboardSectionId
  onSectionChange: (sectionId: DashboardSectionId) => void
  onSignOut: () => void
}

export function AppSidebar({ activeSectionId, onSectionChange, onSignOut }: AppSidebarProps) {
  const experienceProgress =
    (currentUser.currentExperience / currentUser.nextLevelExperience) * 100

  return (
    <aside className="app-sidebar">
      <a href="#overview" className="brand-name dashboard-brand" aria-label="SkillSwap dashboard">
        <IonIcon iconName="infinite-outline" />
        SkillSwap
      </a>

      <nav className="sidebar-nav" aria-label="Navigation du tableau de bord">
        {navigationSections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={activeSectionId === section.id ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => onSectionChange(section.id)}
          >
            <IonIcon iconName={section.iconName} />
            <span>{section.label}</span>
            {section.badgeCount ? <strong>{section.badgeCount}</strong> : null}
          </button>
        ))}
      </nav>

      <div className="sidebar-promo-card">
        <div className="promo-illustration" aria-hidden="true">
          <IonIcon iconName="people-circle-outline" />
        </div>
        <p className="promo-title">Invitez vos amis</p>
        <p className="promo-description">Plus on est, plus on apprend !</p>
        <button type="button" className="promo-button">Inviter</button>
      </div>

      <section className="profile-card">
        <div className="profile-cover" />
        <img
          className="profile-avatar large"
          src={currentUser.avatarUrl}
          alt={`${currentUser.firstName} ${currentUser.lastName}`}
        />
        <h2>
          {currentUser.firstName} {currentUser.lastName}
        </h2>
        <p>{currentUser.field}</p>
        <span className="level-pill">
          <IonIcon iconName="shield-checkmark-outline" />
          Niveau {currentUser.level}
        </span>
        <div className="xp-label">
          <span>
            {currentUser.currentExperience} / {currentUser.nextLevelExperience} XP
          </span>
        </div>
        <div className="progress-track" aria-label="Progression en expérience">
          <span style={{ width: `${experienceProgress}%` }} />
        </div>
        <div className="sidebar-badges">
          <div className="sidebar-badges-header">
            <span>Mes badges</span>
          </div>
          <div className="sidebar-badges-row">
            {badges.map((badge) => (
              <span key={badge.title} className="sidebar-badge-icon" title={badge.title}>
                <IonIcon iconName={badge.iconName} />
              </span>
            ))}
          </div>
        </div>
      </section>

      <button type="button" className="sign-out-button" onClick={onSignOut}>
        <IonIcon iconName="power-outline" />
        Déconnexion
      </button>
    </aside>
  )
}
