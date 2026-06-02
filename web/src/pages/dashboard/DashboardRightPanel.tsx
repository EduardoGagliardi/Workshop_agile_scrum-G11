import { popularSkills, recommendations, statistics } from '../../data/skillSwapData'
import { IonIcon } from '../../shared/IonIcon'

export function DashboardRightPanel() {
  return (
    <aside className="dashboard-right-panel">
      <section className="dashboard-card">
        <div className="card-title">
          <h2>Statistiques</h2>
          <button type="button">Voir tout</button>
        </div>
        <div className="stats-grid">
          {statistics.map((statistic) => (
            <article key={statistic.label} className="stat-item">
              <div className="stat-icon-wrap">
                <IonIcon iconName={statistic.iconName} />
              </div>
              <strong>{statistic.value}</strong>
              <span>{statistic.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-card">
        <div className="card-title">
          <h2>Compétences populaires</h2>
          <button type="button">Voir tout</button>
        </div>
        <ul className="skill-list">
          {popularSkills.map((skill) => (
            <li key={skill.name}>
              <span className="skill-icon-wrap">
                <IonIcon iconName={skill.iconName} />
              </span>
              <strong>{skill.name}</strong>
              <span>{skill.studentsCount} étudiants</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card">
        <div className="card-title">
          <h2>Recommandations pour vous</h2>
          <button type="button">Voir tout</button>
        </div>
        <div className="recommendation-list">
          {recommendations.map((recommendation) => (
            <article key={recommendation.title}>
              <div className="recommendation-icon">
                <IonIcon iconName="calendar-outline" />
              </div>
              <div>
                <strong>{recommendation.title}</strong>
                <span>Avec {recommendation.hostName}</span>
                <small>{recommendation.schedule}</small>
              </div>
              <button type="button" className="view-button">Voir</button>
            </article>
          ))}
        </div>
      </section>
    </aside>
  )
}
