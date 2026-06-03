import { useCallback, useEffect, useRef, useState } from 'react'
import { useSessionChatRealtime } from '../../../hooks/useSessionChatRealtime'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

const SESSION_FILES_BUCKET = 'sessions_files'

type SessionDetail = {
  id: string
  title: string
  description: string
  type: string
  status: string
  scheduled_at: string
  location: string
  max_participants: number
  host_id: string
  skills: { name: string } | null
}

type Participant = {
  user_id: string
  registered_at: string
  users: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  } | null
}

type SessionFile = {
  id: string
  storage_path: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  created_at: string
  uploaded_by: string
  users: { first_name: string; last_name: string } | null
}

type SessionMessage = {
  id: string
  content: string
  created_at: string
  sender_user_id: string
  users: { first_name: string; last_name: string } | null
}

type DashboardTab = 'participants' | 'files' | 'chat'

type Props = {
  sessionId: string
  user: UserProfile
  onBack: () => void
  onViewProfile: (userId: string) => void
  onOpenMessages: (targetUserId: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function SessionDashboardSection({
  sessionId,
  user,
  onBack,
  onViewProfile,
  onOpenMessages,
}: Props) {
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [files, setFiles] = useState<SessionFile[]>([])
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [activeTab, setActiveTab] = useState<DashboardTab>('participants')
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')
  const [actionError, setActionError] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isHost = session?.host_id === user.id

  const fetchParticipants = useCallback(async (hostId: string) => {
    const { data: hostUser } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url')
      .eq('id', hostId)
      .maybeSingle()

    const { data: registrations } = await supabase
      .from('session_registrations')
      .select('user_id, registered_at, users(id, first_name, last_name, avatar_url)')
      .eq('session_id', sessionId)
      .order('registered_at', { ascending: true })

    const list: Participant[] = []

    if (hostUser) {
      list.push({
        user_id: hostUser.id,
        registered_at: '',
        users: hostUser,
      })
    }

    for (const row of (registrations ?? []) as unknown as Participant[]) {
      if (row.user_id !== hostUser?.id) list.push(row)
    }

    setParticipants(list)
  }, [sessionId])

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase
      .from('session_files')
      .select('id, storage_path, file_name, file_size, mime_type, created_at, uploaded_by, users!uploaded_by(first_name, last_name)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })

    setFiles((data as unknown as SessionFile[]) ?? [])
  }, [sessionId])

  const fetchMessages = useCallback(async () => {
    const { data } = await supabase
      .from('session_messages')
      .select('id, content, created_at, sender_user_id, users!sender_user_id(first_name, last_name)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    setMessages((data as unknown as SessionMessage[]) ?? [])
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [sessionId])

  const refreshAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, title, description, type, status, scheduled_at, location, max_participants, host_id, skills(name)')
      .eq('id', sessionId)
      .single()

    if (error || !data) {
      setAccessError('Session introuvable.')
      setSession(null)
      setLoading(false)
      return
    }

    const sessionRow = data as unknown as SessionDetail

    const { data: membership } = await supabase
      .from('session_registrations')
      .select('user_id')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle()

    const canAccess = sessionRow.host_id === user.id || Boolean(membership)
    if (!canAccess) {
      setAccessError('Vous devez être animateur ou inscrit pour accéder à cet espace.')
      setSession(null)
      setLoading(false)
      return
    }

    setSession(sessionRow)
    setAccessError('')

    await Promise.all([
      fetchParticipants(sessionRow.host_id),
      fetchFiles(),
      fetchMessages(),
    ])
    setLoading(false)
  }, [sessionId, user.id, fetchParticipants, fetchFiles, fetchMessages])

  useEffect(() => {
    setLoading(true)
    refreshAll()
  }, [refreshAll])

  useSessionChatRealtime(sessionId, fetchMessages)

  async function handleRemoveParticipant(participantId: string) {
    if (!isHost || participantId === user.id) return
    if (!confirm('Retirer ce participant de la session ?')) return

    setRemovingUserId(participantId)
    setActionError('')

    const { error } = await supabase
      .from('session_registrations')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', participantId)

    setRemovingUserId(null)

    if (error) {
      setActionError(error.message)
      return
    }

    fetchParticipants(session.host_id)
  }

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault()
    const content = newMessage.trim()
    if (!content) return

    setSendLoading(true)
    setActionError('')

    const { error } = await supabase.from('session_messages').insert({
      session_id: sessionId,
      sender_user_id: user.id,
      content,
    })

    setSendLoading(false)

    if (error) {
      setActionError(error.message)
      return
    }

    setNewMessage('')
    fetchMessages()
  }

  async function handleUploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadLoading(true)
    setActionError('')

    const storagePath = `${sessionId}/${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from(SESSION_FILES_BUCKET)
      .upload(storagePath, file, { upsert: false })

    if (uploadError) {
      setUploadLoading(false)
      setActionError(uploadError.message)
      return
    }

    const { error: insertError } = await supabase.from('session_files').insert({
      session_id: sessionId,
      uploaded_by: user.id,
      storage_path: storagePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
    })

    setUploadLoading(false)

    if (insertError) {
      setActionError(insertError.message)
      return
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchFiles()
  }

  async function handleDownloadFile(file: SessionFile) {
    setActionError('')
    const { data, error } = await supabase.storage
      .from(SESSION_FILES_BUCKET)
      .createSignedUrl(file.storage_path, 3600)

    if (error || !data?.signedUrl) {
      setActionError(error?.message ?? 'Impossible de télécharger le fichier.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleDeleteFile(file: SessionFile) {
    if (!confirm(`Supprimer « ${file.file_name} » ?`)) return
    if (file.uploaded_by !== user.id && !isHost) return

    setActionError('')

    await supabase.storage.from(SESSION_FILES_BUCKET).remove([file.storage_path])
    const { error } = await supabase.from('session_files').delete().eq('id', file.id)

    if (error) {
      setActionError(error.message)
      return
    }

    fetchFiles()
  }

  if (loading) {
    return (
      <div className="section-page">
        <div className="section-loading">
          <IonIcon iconName="reload-outline" /> Chargement de l'espace session…
        </div>
      </div>
    )
  }

  if (accessError || !session) {
    return (
      <div className="section-page">
        <button type="button" className="ghost-button profile-back-button" onClick={onBack}>
          <IonIcon iconName="arrow-back-outline" /> Retour aux sessions
        </button>
        <div className="empty-state">
          <IonIcon iconName="calendar-outline" />
          <p>{accessError || 'Session introuvable.'}</p>
        </div>
      </div>
    )
  }

  const registeredCount = participants.filter((participant) => participant.user_id !== session.host_id).length

  return (
    <div className="section-page session-dashboard">
      <button type="button" className="ghost-button profile-back-button" onClick={onBack}>
        <IonIcon iconName="arrow-back-outline" /> Retour aux sessions
      </button>

      <header className="session-dashboard-header dashboard-card">
        <div>
          <span className="session-type-badge">{session.type}</span>
          <h1>{session.title}</h1>
          {session.skills && (
            <span className="skill-tag">
              <IonIcon iconName="library-outline" /> {session.skills.name}
            </span>
          )}
          <p className="session-dashboard-description">{session.description}</p>
          <div className="session-card-meta">
            <span><IonIcon iconName="calendar-outline" />{formatDate(session.scheduled_at)}</span>
            <span><IonIcon iconName="location-outline" />{session.location}</span>
            <span>
              <IonIcon iconName="people-outline" />
              {registeredCount} / {session.max_participants} inscrits
            </span>
          </div>
        </div>
        {isHost && <span className="host-badge"><IonIcon iconName="mic-outline" /> Vous animez</span>}
      </header>

      {actionError && <p className="auth-feedback auth-feedback-error">{actionError}</p>}

      <div className="tab-bar session-dashboard-tabs">
        <button
          type="button"
          className={activeTab === 'participants' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('participants')}
        >
          <IonIcon iconName="people-outline" /> Participants
        </button>
        <button
          type="button"
          className={activeTab === 'files' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('files')}
        >
          <IonIcon iconName="folder-outline" /> Fichiers
        </button>
        <button
          type="button"
          className={activeTab === 'chat' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('chat')}
        >
          <IonIcon iconName="chatbubbles-outline" /> Discussion
        </button>
      </div>

      {activeTab === 'participants' && (
        <section className="dashboard-card session-dashboard-panel">
          <div className="card-title">
            <h2>Participants ({participants.length})</h2>
          </div>
          <ul className="session-participants-list">
            {participants.map((participant) => {
              const profile = participant.users
              if (!profile) return null
              const isSessionHost = participant.user_id === session.host_id
              const initials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`

              return (
                <li key={participant.user_id} className="session-participant-row">
                  <button
                    type="button"
                    className="session-participant-main"
                    onClick={() => onViewProfile(participant.user_id)}
                  >
                    {profile.avatar_url ? (
                      <img className="profile-avatar" src={profile.avatar_url} alt="" />
                    ) : (
                      <div className="profile-avatar profile-avatar-initials">{initials}</div>
                    )}
                    <div>
                      <strong>{profile.first_name} {profile.last_name}</strong>
                      <span>
                        {isSessionHost
                          ? 'Animateur'
                          : `Inscrit le ${formatDate(participant.registered_at)}`}
                      </span>
                    </div>
                  </button>
                  <div className="session-participant-actions">
                    {participant.user_id !== user.id && (
                      <button
                        type="button"
                        className="ghost-button"
                        onClick={() => onOpenMessages(participant.user_id)}
                      >
                        <IonIcon iconName="chatbox-outline" /> Message
                      </button>
                    )}
                    {isHost && !isSessionHost && (
                      <button
                        type="button"
                        className="ghost-button danger-text"
                        disabled={removingUserId === participant.user_id}
                        onClick={() => handleRemoveParticipant(participant.user_id)}
                      >
                        <IonIcon iconName="trash-outline" />
                        {removingUserId === participant.user_id ? '…' : 'Retirer'}
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {activeTab === 'files' && (
        <section className="dashboard-card session-dashboard-panel">
          <div className="card-title">
            <h2>Fichiers partagés</h2>
            <button
              type="button"
              className="primary-button"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
              disabled={uploadLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              <IonIcon iconName="cloud-upload-outline" />
              {uploadLoading ? 'Envoi…' : 'Ajouter un fichier'}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleUploadFile}
          />
          <p className="session-dashboard-hint">
            Les fichiers sont stockés dans l'espace <strong>sessions_files</strong> (Supabase Storage).
            Tous les inscrits peuvent les consulter.
          </p>
          {files.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              <IonIcon iconName="folder-outline" />
              <p>Aucun fichier pour l'instant.</p>
            </div>
          ) : (
            <ul className="session-files-list">
              {files.map((file) => {
                const uploader = file.users
                const canDelete = isHost || file.uploaded_by === user.id
                return (
                  <li key={file.id} className="session-file-row">
                    <div className="session-file-icon">
                      <IonIcon iconName="document-text-outline" />
                    </div>
                    <div className="session-file-info">
                      <strong>{file.file_name}</strong>
                      <span>
                        {uploader ? `${uploader.first_name} ${uploader.last_name}` : 'Utilisateur'}
                        {' · '}
                        {formatDate(file.created_at)}
                        {file.file_size ? ` · ${formatFileSize(file.file_size)}` : ''}
                      </span>
                    </div>
                    <div className="session-participant-actions">
                      <button type="button" className="ghost-button" onClick={() => handleDownloadFile(file)}>
                        <IonIcon iconName="download-outline" /> Télécharger
                      </button>
                      {canDelete && (
                        <button type="button" className="ghost-button danger-text" onClick={() => handleDeleteFile(file)}>
                          <IonIcon iconName="trash-outline" />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {activeTab === 'chat' && (
        <section className="dashboard-card session-dashboard-panel session-dashboard-chat">
          <div className="card-title">
            <h2>Discussion de groupe</h2>
            <span className="session-dashboard-hint">Échangez avant la session</span>
          </div>
          <div className="session-chat-messages">
            {messages.length === 0 ? (
              <p className="thread-empty">Aucun message. Lancez la conversation !</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`bubble-wrap ${message.sender_user_id === user.id ? 'mine' : 'theirs'}`}
                >
                  <div className="bubble">
                    {message.sender_user_id !== user.id && message.users && (
                      <small className="bubble-sender">
                        {message.users.first_name} {message.users.last_name}
                      </small>
                    )}
                    <p>{message.content}</p>
                    <time>{formatDate(message.created_at)}</time>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="thread-input" onSubmit={handleSendMessage}>
            <input
              placeholder="Message pour le groupe…"
              value={newMessage}
              onChange={(event) => setNewMessage(event.target.value)}
              disabled={sendLoading}
            />
            <button type="submit" className="primary-button" disabled={sendLoading || !newMessage.trim()}>
              <IonIcon iconName="send-outline" />
            </button>
          </form>
        </section>
      )}
    </div>
  )
}
