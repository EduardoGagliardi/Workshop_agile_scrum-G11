import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'
import { SessionDashboardSection } from './SessionDashboardSection'

type SessionRow = {
  id: string
  title: string
  type: string
  status: string
  scheduled_at: string
  location: string
  max_participants: number
  host_id: string
  skills: { id: number; name: string; category: string } | null
  session_registrations: { user_id: string }[]
}

type Skill = { id: number; name: string; category: string }

type SessionFormData = {
  title: string
  description: string
  type: string
  skill_id: string
  scheduled_at: string
  location: string
  max_participants: string
}

const STATUS_LABELS: Record<string, string> = {
  Planifiée: 'Planifiée',
  'En cours': 'En cours',
  Terminée: 'Terminée',
  Annulée: 'Annulée',
}

const SESSION_TYPES = ['Cours rapide', 'Atelier collectif', 'Club thématique']

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type Props = {
  user: UserProfile
  onViewProfile: (userId: string) => void
  onOpenMessages: (targetUserId: string) => void
}

export function SessionsSection({ user, onViewProfile, onOpenMessages }: Props) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [tab, setTab] = useState<'hosted' | 'registered'>('hosted')
  const [hostedSessions, setHostedSessions] = useState<SessionRow[]>([])
  const [registeredSessions, setRegisteredSessions] = useState<SessionRow[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [form, setForm] = useState<SessionFormData>({
    title: '',
    description: '',
    type: SESSION_TYPES[0],
    skill_id: '',
    scheduled_at: '',
    location: '',
    max_participants: '10',
  })

  async function fetchData() {
    setLoading(true)

    const [{ data: hosted }, { data: registrations }, { data: allSkills }] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, type, status, scheduled_at, location, max_participants, host_id, skills(id, name, category), session_registrations(user_id)')
        .eq('host_id', user.id)
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('session_registrations')
        .select('sessions(id, title, type, status, scheduled_at, location, max_participants, host_id, skills(id, name, category), session_registrations(user_id))')
        .eq('user_id', user.id),
      supabase.from('skills').select('id, name, category').order('name'),
    ])

    setHostedSessions((hosted as unknown as SessionRow[]) ?? [])
    const regSessions = (registrations ?? [])
      .map((r: any) => r.sessions as SessionRow | null)
      .filter(Boolean) as SessionRow[]
    setRegisteredSessions(regSessions)
    setSkills((allSkills as Skill[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [user.id])

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.skill_id) { setFormError('Veuillez choisir une compétence.'); return }
    setFormLoading(true)

    const { error } = await supabase.from('sessions').insert({
      title: form.title,
      description: form.description,
      type: form.type,
      skill_id: Number(form.skill_id),
      scheduled_at: form.scheduled_at,
      location: form.location,
      max_participants: Number(form.max_participants),
      host_id: user.id,
    })

    setFormLoading(false)

    if (error) {
      setFormError(error.message)
    } else {
      setShowForm(false)
      setForm({ title: '', description: '', type: SESSION_TYPES[0], skill_id: '', scheduled_at: '', location: '', max_participants: '10' })
      fetchData()
    }
  }

  const sessions = tab === 'hosted' ? hostedSessions : registeredSessions

  if (selectedSessionId) {
    return (
      <SessionDashboardSection
        sessionId={selectedSessionId}
        user={user}
        onBack={() => setSelectedSessionId(null)}
        onViewProfile={onViewProfile}
        onOpenMessages={onOpenMessages}
      />
    )
  }

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Mes sessions</h1>
          <p className="section-page-subtitle">Gérez vos sessions animées et vos inscriptions</p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowForm(!showForm)}>
          <IonIcon iconName={showForm ? 'close-outline' : 'add-outline'} />
          {showForm ? 'Annuler' : 'Créer une session'}
        </button>
      </div>

      {showForm && (
        <form className="inline-form dashboard-card" onSubmit={handleCreateSession}>
          <h2 className="inline-form-title">Nouvelle session</h2>
          <div className="form-grid-2">
            <div className="form-row">
              <label>Titre</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: HTML/CSS pour débutants" />
            </div>
            <div className="form-row">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Compétence</label>
              <select required value={form.skill_id} onChange={e => setForm(f => ({ ...f, skill_id: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
              </select>
            </div>
            <div className="form-row">
              <label>Date et heure</label>
              <input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
            </div>
            <div className="form-row">
              <label>Lieu</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Salle B204 ou Zoom" />
            </div>
            <div className="form-row">
              <label>Participants max</label>
              <input required type="number" min="1" max="100" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '0.5rem' }}>
            <label>Description</label>
            <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez le contenu de la session…" />
          </div>
          {formError && <p className="auth-feedback auth-feedback-error">{formError}</p>}
          {skills.length === 0 && (
            <p className="auth-feedback auth-feedback-error">Aucune compétence disponible. Un administrateur doit d'abord ajouter des compétences à la base de données.</p>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="primary-button" disabled={formLoading || skills.length === 0}>
              {formLoading ? 'Création…' : 'Créer la session'}
            </button>
          </div>
        </form>
      )}

      <div className="tab-bar">
        <button type="button" className={tab === 'hosted' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('hosted')}>
          Mes sessions animées ({hostedSessions.length})
        </button>
        <button type="button" className={tab === 'registered' ? 'tab-btn active' : 'tab-btn'} onClick={() => setTab('registered')}>
          Mes inscriptions ({registeredSessions.length})
        </button>
      </div>

      {loading ? (
        <div className="section-loading"><IonIcon iconName="reload-outline" /> Chargement…</div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <IonIcon iconName="calendar-outline" />
          <p>{tab === 'hosted' ? "Vous n'animez aucune session pour l'instant." : "Vous n'êtes inscrit à aucune session."}</p>
          {tab === 'hosted' && (
            <button type="button" className="primary-button" onClick={() => setShowForm(true)}>
              <IonIcon iconName="add-outline" /> Créer une session
            </button>
          )}
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map(session => (
            <article
              key={session.id}
              className="session-card dashboard-card session-card-clickable"
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSessionId(session.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  setSelectedSessionId(session.id)
                }
              }}
            >
              <div className="session-card-header">
                <span className="session-type-badge">{session.type}</span>
                <span className={`status-badge status-${session.status.replace(' ', '-').toLowerCase()}`}>
                  {STATUS_LABELS[session.status] ?? session.status}
                </span>
              </div>
              <h3>{session.title}</h3>
              {session.skills && (
                <span className="skill-tag">
                  <IonIcon iconName="library-outline" />
                  {session.skills.name}
                </span>
              )}
              <div className="session-card-meta">
                <span><IonIcon iconName="calendar-outline" />{formatDate(session.scheduled_at)}</span>
                <span><IonIcon iconName="location-outline" />{session.location}</span>
                <span>
                  <IonIcon iconName="people-outline" />
                  {session.session_registrations.length} / {session.max_participants} participants
                </span>
              </div>
              <p className="session-card-cta">
                <IonIcon iconName="arrow-forward-outline" /> Ouvrir l'espace session
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
