import logo from '../../assets/logo.png'
import { navigationSections, type DashboardSectionId } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'
import type { UserProfile } from '../../types'
import { xpProgress } from '../../types'

type AppSidebarProps = {
  user: UserProfile
  activeSectionId: DashboardSectionId
  onSectionChange: (sectionId: DashboardSectionId) => void
  onSignOut: () => void
}

export function AppSidebar({ user, activeSectionId, onSectionChange, onSignOut }: AppSidebarProps) {
  const { xpCurrent, xpNeeded, percent } = xpProgress(user.experiencePoints, user.level)
  const initials = user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase()

  return (
    <aside className="app-sidebar">
      <a href="#overview" className="brand-name dashboard-brand" aria-label="SkillSwap dashboard">
        <img src={logo} alt="" className="brand-logo" aria-hidden="true" />
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
        {user.avatarUrl ? (
          <img
            className="profile-avatar large"
            src={user.avatarUrl}
            alt={`${user.firstName} ${user.lastName}`}
          />
        ) : (
          <div className="profile-avatar large profile-avatar-initials">
            {initials}
          </div>
        )}
        <h2>{user.firstName} {user.lastName}</h2>
        <p>{user.accountType}</p>
        <span className="level-pill">
          <IonIcon iconName="shield-checkmark-outline" />
          Niveau {user.level}
        </span>
        <div className="xp-label">
          <span>{xpCurrent} / {xpNeeded} XP</span>
        </div>
        <div className="progress-track" aria-label="Progression en expérience">
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="sidebar-badges">
          <div className="sidebar-badges-header">
            <span>Mes badges</span>
          </div>
          <div className="sidebar-badges-row">
            <span className="sidebar-badge-icon" title="Étudiant actif">
              <IonIcon iconName="school-outline" />
            </span>
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
