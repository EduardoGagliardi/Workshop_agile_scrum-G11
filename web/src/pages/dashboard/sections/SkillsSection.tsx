import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type UserSkillRow = {
  skill_id: number
  role: 'Enseignant' | 'Apprenant'
  level: string
  skills: { id: number; name: string; category: string }
}

type Skill = { id: number; name: string; category: string }

const SKILL_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert']

type Props = { user: UserProfile }

export function SkillsSection({ user }: Props) {
  const [userSkills, setUserSkills] = useState<UserSkillRow[]>([])
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formSkillId, setFormSkillId] = useState('')
  const [formRole, setFormRole] = useState<'Enseignant' | 'Apprenant'>('Apprenant')
  const [formLevel, setFormLevel] = useState(SKILL_LEVELS[0])

  async function fetchData() {
    setLoading(true)
    const [{ data: us }, { data: sk }] = await Promise.all([
      supabase
        .from('user_skills')
        .select('skill_id, role, level, skills(id, name, category)')
        .eq('user_id', user.id),
      supabase.from('skills').select('id, name, category').order('name'),
    ])
    setUserSkills((us as unknown as UserSkillRow[]) ?? [])
    setAllSkills((sk as Skill[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user.id])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!formSkillId) { setFormError('Choisissez une compétence.'); return }
    setFormLoading(true)

    const { error } = await supabase.from('user_skills').insert({
      user_id: user.id,
      skill_id: Number(formSkillId),
      role: formRole,
      level: formLevel,
    })

    setFormLoading(false)
    if (error) {
      setFormError(error.message)
    } else {
      setShowForm(false)
      setFormSkillId('')
      fetchData()
    }
  }

  async function handleRemove(skillId: number) {
    await supabase.from('user_skills').delete().eq('user_id', user.id).eq('skill_id', skillId)
    fetchData()
  }

  const owned = userSkills.map(us => us.skill_id)
  const available = allSkills.filter(s => !owned.includes(s.id))

  const teachers = userSkills.filter(us => us.role === 'Enseignant')
  const learners = userSkills.filter(us => us.role === 'Apprenant')

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Mes compétences</h1>
          <p className="section-page-subtitle">Gérez ce que vous enseignez et ce que vous apprenez</p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowForm(!showForm)}>
          <IonIcon iconName={showForm ? 'close-outline' : 'add-outline'} />
          {showForm ? 'Annuler' : 'Ajouter'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form dashboard-card" onSubmit={handleAdd}>
          <h2 className="inline-form-title">Ajouter une compétence</h2>
          <div className="form-grid-3">
            <div className="form-row">
              <label>Compétence</label>
              <select required value={formSkillId} onChange={e => setFormSkillId(e.target.value)}>
                <option value="">-- Choisir --</option>
                {available.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Rôle</label>
              <select value={formRole} onChange={e => setFormRole(e.target.value as 'Enseignant' | 'Apprenant')}>
                <option value="Apprenant">Apprenant — je veux apprendre</option>
                <option value="Enseignant">Enseignant — je peux enseigner</option>
              </select>
            </div>
            <div className="form-row">
              <label>Niveau</label>
              <select value={formLevel} onChange={e => setFormLevel(e.target.value)}>
                {SKILL_LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          {formError && <p className="auth-feedback auth-feedback-error">{formError}</p>}
          {available.length === 0 && !formError && (
            <p className="auth-feedback auth-feedback-success">Vous avez déjà toutes les compétences disponibles !</p>
          )}
          <button type="submit" className="primary-button" disabled={formLoading || available.length === 0} style={{ marginTop: '0.5rem' }}>
            {formLoading ? 'Ajout…' : 'Ajouter'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="section-loading"><IonIcon iconName="reload-outline" /> Chargement…</div>
      ) : userSkills.length === 0 ? (
        <div className="empty-state">
          <IonIcon iconName="library-outline" />
          <p>Vous n'avez encore ajouté aucune compétence.</p>
          <button type="button" className="primary-button" onClick={() => setShowForm(true)}>
            <IonIcon iconName="add-outline" /> Ajouter une compétence
          </button>
        </div>
      ) : (
        <>
          {teachers.length > 0 && (
            <section className="dashboard-card">
              <div className="card-title">
                <h2>J'enseigne ({teachers.length})</h2>
              </div>
              <div className="skills-grid">
                {teachers.map(us => (
                  <SkillCard key={us.skill_id} us={us} onRemove={handleRemove} />
                ))}
              </div>
            </section>
          )}
          {learners.length > 0 && (
            <section className="dashboard-card">
              <div className="card-title">
                <h2>J'apprends ({learners.length})</h2>
              </div>
              <div className="skills-grid">
                {learners.map(us => (
                  <SkillCard key={us.skill_id} us={us} onRemove={handleRemove} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function SkillCard({ us, onRemove }: { us: UserSkillRow; onRemove: (id: number) => void }) {
  return (
    <div className="skill-card">
      <div className="skill-card-icon">
        <IonIcon iconName={us.role === 'Enseignant' ? 'school-outline' : 'book-outline'} />
      </div>
      <div className="skill-card-info">
        <strong>{us.skills?.name ?? '—'}</strong>
        <span>{us.skills?.category}</span>
        <div className="skill-card-tags">
          <span className={`role-pill ${us.role === 'Enseignant' ? 'teacher' : 'learner'}`}>{us.role}</span>
          <span className="level-pill-sm">{us.level}</span>
        </div>
      </div>
      <button
        type="button"
        className="icon-button remove-btn"
        aria-label="Retirer cette compétence"
        onClick={() => onRemove(us.skill_id)}
      >
        <IonIcon iconName="trash-outline" />
      </button>
    </div>
  )
}
