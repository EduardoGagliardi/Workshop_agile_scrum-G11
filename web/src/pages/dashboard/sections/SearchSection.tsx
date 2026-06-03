import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'

type SkillResult = {
  id: number
  name: string
  category: string
  teacherCount: number
}

type UserResult = {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  level: number
  skills: { role: string; level: string; skill_name: string }[]
}

export function SearchSection() {
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState<SkillResult[]>([])
  const [users, setUsers] = useState<UserResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  async function doSearch(q: string) {
    if (!q.trim()) { setSkills([]); setUsers([]); setHasSearched(false); return }
    setLoading(true)
    setHasSearched(true)

    const [{ data: skillsData }, { data: usersData }] = await Promise.all([
      supabase
        .from('skills')
        .select('id, name, category, user_skills(role)')
        .ilike('name', `%${q}%`)
        .limit(8),
      supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, level, user_skills(role, level, skills(name))')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
        .limit(8),
    ])

    const mappedSkills: SkillResult[] = (skillsData ?? []).map((s: any) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      teacherCount: (s.user_skills ?? []).filter((us: any) => us.role === 'Enseignant').length,
    }))

    const mappedUsers: UserResult[] = (usersData ?? []).map((u: any) => ({
      id: u.id,
      first_name: u.first_name,
      last_name: u.last_name,
      avatar_url: u.avatar_url,
      level: u.level,
      skills: (u.user_skills ?? []).map((us: any) => ({
        role: us.role,
        level: us.level,
        skill_name: Array.isArray(us.skills) ? us.skills[0]?.name ?? '' : us.skills?.name ?? '',
      })),
    }))

    setSkills(mappedSkills)
    setUsers(mappedUsers)
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 350)
    return () => clearTimeout(timer)
  }, [query])

  const noResults = hasSearched && !loading && skills.length === 0 && users.length === 0

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Recherche</h1>
          <p className="section-page-subtitle">Trouvez des compétences, des mentors ou des apprenants</p>
        </div>
      </div>

      <div className="search-bar-large dashboard-card">
        <IonIcon iconName="search-outline" />
        <input
          autoFocus
          type="search"
          placeholder="Rechercher une compétence, un prénom, un nom…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && <IonIcon iconName="reload-outline" />}
      </div>

      {!hasSearched && (
        <div className="empty-state">
          <IonIcon iconName="search-circle-outline" />
          <p>Tapez un mot-clé pour commencer la recherche.</p>
        </div>
      )}

      {noResults && (
        <div className="empty-state">
          <IonIcon iconName="sad-outline" />
          <p>Aucun résultat pour « {query} ».</p>
        </div>
      )}

      {skills.length > 0 && (
        <section className="dashboard-card">
          <div className="card-title"><h2>Compétences ({skills.length})</h2></div>
          <div className="search-results-grid">
            {skills.map(skill => (
              <div key={skill.id} className="search-result-card">
                <div className="search-result-icon">
                  <IonIcon iconName="library-outline" />
                </div>
                <div>
                  <strong>{skill.name}</strong>
                  <span>{skill.category}</span>
                  <span className="search-result-meta">
                    <IonIcon iconName="school-outline" />
                    {skill.teacherCount} enseignant{skill.teacherCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {users.length > 0 && (
        <section className="dashboard-card">
          <div className="card-title"><h2>Étudiants ({users.length})</h2></div>
          <div className="search-results-grid">
            {users.map(u => {
              const initials = u.first_name.charAt(0) + u.last_name.charAt(0)
              return (
                <div key={u.id} className="search-result-card">
                  {u.avatar_url ? (
                    <img className="profile-avatar" src={u.avatar_url} alt={`${u.first_name} ${u.last_name}`} />
                  ) : (
                    <div className="profile-avatar profile-avatar-initials" style={{ fontSize: '0.8rem' }}>{initials}</div>
                  )}
                  <div>
                    <strong>{u.first_name} {u.last_name}</strong>
                    <span className="search-result-meta">
                      <IonIcon iconName="shield-checkmark-outline" /> Niveau {u.level}
                    </span>
                    {u.skills.length > 0 && (
                      <div className="search-skill-tags">
                        {u.skills.slice(0, 3).map(s => (
                          <span key={s.skill_name} className={`role-pill ${s.role === 'Enseignant' ? 'teacher' : 'learner'}`}>
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
