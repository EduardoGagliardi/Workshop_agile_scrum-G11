import { useCallback, useEffect, useState } from 'react'
import { useNotificationsRealtime } from '../../../hooks/useNotificationsRealtime'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type ContactRequest = {
  id: string
  sender_user_id: string
  created_at: string
  users: { first_name: string; last_name: string }
}

type SessionEvent = {
  session_id: string
  registered_at: string
  sessions: { title: string } | null
  users: { first_name: string; last_name: string } | null
}

type Props = { user: UserProfile }

export function NotificationsSection({ user }: Props) {
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([])
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [{ data: requests }, { data: registrations }] = await Promise.all([
      supabase
        .from('contact_requests')
        .select('id, sender_user_id, created_at, users!sender_user_id(first_name, last_name)')
        .eq('receiver_user_id', user.id)
        .eq('status', 'pending'),
      supabase
        .from('session_registrations')
        .select('session_id, registered_at, sessions(title), users!user_id(first_name, last_name)')
        .in('session_id',
          (await supabase.from('sessions').select('id').eq('host_id', user.id)).data?.map((s: { id: string }) => s.id) ?? []
        )
        .order('registered_at', { ascending: false })
        .limit(10),
    ])
    setContactRequests((requests as unknown as ContactRequest[]) ?? [])
    setSessionEvents((registrations as unknown as SessionEvent[]) ?? [])
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useNotificationsRealtime(user.id, fetchData)

  async function handleContactRequest(requestId: string, accept: boolean) {
    setActionLoading(requestId)
    await supabase
      .from('contact_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', requestId)
    setActionLoading(null)
    fetchData()
  }

  const total = contactRequests.length + sessionEvents.length

  return (
    <div className="section-page">
      <div className="section-page-header">
        <div>
          <h1>Notifications</h1>
          <p className="section-page-subtitle">{total} notification{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="section-loading"><IonIcon iconName="reload-outline" /> Chargement…</div>
      ) : total === 0 ? (
        <div className="empty-state">
          <IonIcon iconName="notifications-off-outline" />
          <p>Aucune notification pour l'instant.</p>
        </div>
      ) : (
        <div className="notif-list dashboard-card">
          {contactRequests.length > 0 && (
            <>
              <p className="notif-group-label">Demandes de contact en attente</p>
              {contactRequests.map(req => (
                <div key={req.id} className="notif-item">
                  <div className="notif-icon contact">
                    <IonIcon iconName="person-add-outline" />
                  </div>
                  <div className="notif-body">
                    <strong>{req.users?.first_name} {req.users?.last_name}</strong>
                    <span> souhaite vous ajouter comme contact.</span>
                    <time>{new Date(req.created_at).toLocaleDateString('fr-FR')}</time>
                  </div>
                  <div className="notif-actions">
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                      disabled={actionLoading === req.id}
                      onClick={() => handleContactRequest(req.id, true)}
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                      disabled={actionLoading === req.id}
                      onClick={() => handleContactRequest(req.id, false)}
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {sessionEvents.length > 0 && (
            <>
              <p className="notif-group-label">Inscriptions à vos sessions</p>
              {sessionEvents.map((ev, i) => (
                <div key={`${ev.session_id}-${i}`} className="notif-item">
                  <div className="notif-icon session">
                    <IonIcon iconName="calendar-outline" />
                  </div>
                  <div className="notif-body">
                    <strong>{ev.users?.first_name} {ev.users?.last_name}</strong>
                    <span> s'est inscrit(e) à <em>{ev.sessions?.title}</em>.</span>
                    <time>{new Date(ev.registered_at).toLocaleDateString('fr-FR')}</time>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
