import { useCallback, useEffect, useRef, useState } from 'react'
import { useMessagesRealtime } from '../../../hooks/useMessagesRealtime'
import { findOrCreateConversation } from '../../../lib/conversations'
import { supabase } from '../../../lib/supabaseClient'
import { IonIcon } from '../../../shared/IonIcon'
import type { UserProfile } from '../../../types'

type Participant = {
  conversation_id: string
  user_id: string
  users: { id: string; first_name: string; last_name: string; avatar_url: string | null }
}

type Conversation = {
  id: string
  otherUser: { id: string; first_name: string; last_name: string; avatar_url: string | null }
  lastMessage: string
  lastAt: string
}

type Message = {
  id: string
  content: string
  created_at: string
  sender_user_id: string
  users: { first_name: string; last_name: string } | null
}

type Props = {
  user: UserProfile
  initialTargetUserId?: string | null
  onClearInitialTarget?: () => void
  onViewProfile: (userId: string) => void
}

export function MessagesSection({
  user,
  initialTargetUserId,
  onClearInitialTarget,
  onViewProfile,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendLoading, setSendLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewConv, setShowNewConv] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; first_name: string; last_name: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id)

    const convIds = (participations ?? []).map((p: { conversation_id: string }) => p.conversation_id)

    if (convIds.length === 0) { setConversations([]); setLoading(false); return }

    const [{ data: allParticipants }, { data: lastMsgs }] = await Promise.all([
      supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, users(id, first_name, last_name, avatar_url)')
        .in('conversation_id', convIds)
        .neq('user_id', user.id),
      supabase
        .from('messages')
        .select('conversation_id, content, created_at')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false }),
    ])

    const convMap = new Map<string, Conversation>()

    for (const convId of convIds) {
      const participant = (allParticipants as unknown as Participant[] ?? []).find(p => p.conversation_id === convId)
      const lastMsg = (lastMsgs ?? []).find((m: { conversation_id: string }) => m.conversation_id === convId) as { content: string; created_at: string } | undefined

      if (participant) {
        convMap.set(convId, {
          id: convId,
          otherUser: participant.users,
          lastMessage: lastMsg?.content ?? '',
          lastAt: lastMsg?.created_at ?? '',
        })
      }
    }

    const sorted = Array.from(convMap.values()).sort((a, b) =>
      new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    )

    setConversations(sorted)
    setSelectedId((current) => current ?? sorted[0]?.id ?? null)
    setLoading(false)
  }, [user.id])

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('id, content, created_at, sender_user_id, users!sender_user_id(first_name, last_name)')
      .eq('conversation_id', convId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    setMessages((data as unknown as Message[]) ?? [])
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const refreshMessagesView = useCallback(() => {
    fetchConversations()
    if (selectedId) fetchMessages(selectedId)
  }, [fetchConversations, fetchMessages, selectedId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId)
  }, [selectedId, fetchMessages])

  useMessagesRealtime(user.id, refreshMessagesView)

  useEffect(() => {
    if (!initialTargetUserId) return

    async function openTargetConversation(targetUserId: string) {
      const conversationId = await findOrCreateConversation(user.id, targetUserId)
      if (conversationId) {
        setSelectedId(conversationId)
        await fetchConversations()
        await fetchMessages(conversationId)
      }
      onClearInitialTarget?.()
    }

    openTargetConversation(initialTargetUserId)
  }, [initialTargetUserId, user.id, fetchConversations, fetchMessages, onClearInitialTarget])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedId) return
    setSendLoading(true)
    const content = newMessage.trim()
    setNewMessage('')
    const { data: insertedMessage } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedId,
        sender_user_id: user.id,
        content,
      })
      .select('id, content, created_at, sender_user_id')
      .single()

    if (insertedMessage) {
      setMessages((previous) => {
        if (previous.some((message) => message.id === insertedMessage.id)) return previous
        return [
          ...previous,
          {
            ...insertedMessage,
            users: { first_name: user.firstName, last_name: user.lastName },
          },
        ]
      })
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }

    setSendLoading(false)
    fetchConversations()
  }

  async function searchUsers(q: string) {
    if (!q.trim()) { setSearchResults([]); return }
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .neq('id', user.id)
      .limit(6)
    setSearchResults((data ?? []) as { id: string; first_name: string; last_name: string }[])
  }

  async function startConversation(targetId: string) {
    const conversationId = await findOrCreateConversation(user.id, targetId)
    if (!conversationId) return
    setShowNewConv(false)
    setUserSearch('')
    setSearchResults([])
    await fetchConversations()
    setSelectedId(conversationId)
  }

  const selectedConv = conversations.find(c => c.id === selectedId)

  function formatTime(iso: string) {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="messages-layout">
      <aside className="messages-sidebar dashboard-card">
        <div className="messages-sidebar-header">
          <h2>Messages</h2>
          <button type="button" className="icon-button" onClick={() => setShowNewConv(!showNewConv)} aria-label="Nouvelle conversation">
            <IonIcon iconName={showNewConv ? 'close-outline' : 'create-outline'} />
          </button>
        </div>

        {showNewConv && (
          <div className="new-conv-form">
            <input
              placeholder="Rechercher un utilisateur…"
              value={userSearch}
              onChange={e => { setUserSearch(e.target.value); searchUsers(e.target.value) }}
            />
            {searchResults.map(u => (
              <div key={u.id} className="user-search-result-row">
                <button type="button" className="user-search-result" onClick={() => startConversation(u.id)}>
                  <div className="profile-avatar profile-avatar-initials" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                    {u.first_name.charAt(0)}{u.last_name.charAt(0)}
                  </div>
                  {u.first_name} {u.last_name}
                </button>
                <button
                  type="button"
                  className="ghost-button user-search-profile-link"
                  onClick={() => onViewProfile(u.id)}
                >
                  Profil
                </button>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="section-loading"><IonIcon iconName="reload-outline" /></div>
        ) : conversations.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <IonIcon iconName="chatbox-outline" />
            <p>Aucune conversation</p>
          </div>
        ) : (
          <ul className="conv-list">
            {conversations.map(conv => (
              <li key={conv.id}>
                <button
                  type="button"
                  className={`conv-item ${selectedId === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <div className="profile-avatar profile-avatar-initials conv-avatar">
                    {conv.otherUser.first_name.charAt(0)}{conv.otherUser.last_name.charAt(0)}
                  </div>
                  <div className="conv-info">
                    <strong>{conv.otherUser.first_name} {conv.otherUser.last_name}</strong>
                    <span>{conv.lastMessage || 'Nouvelle conversation'}</span>
                  </div>
                  <em>{formatTime(conv.lastAt)}</em>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <div className="messages-thread dashboard-card">
        {!selectedConv ? (
          <div className="empty-state">
            <IonIcon iconName="chatbubbles-outline" />
            <p>Sélectionnez une conversation ou créez-en une nouvelle.</p>
          </div>
        ) : (
          <>
            <div className="thread-header">
              <button
                type="button"
                className="thread-header-profile"
                onClick={() => onViewProfile(selectedConv.otherUser.id)}
              >
                <div className="profile-avatar profile-avatar-initials conv-avatar">
                  {selectedConv.otherUser.first_name.charAt(0)}{selectedConv.otherUser.last_name.charAt(0)}
                </div>
                <strong>{selectedConv.otherUser.first_name} {selectedConv.otherUser.last_name}</strong>
              </button>
            </div>

            <div className="thread-messages">
              {messages.length === 0 ? (
                <p className="thread-empty">Pas encore de messages. Envoyez le premier !</p>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`bubble-wrap ${msg.sender_user_id === user.id ? 'mine' : 'theirs'}`}>
                    <div className="bubble">
                      <p>{msg.content}</p>
                      <time>{formatTime(msg.created_at)}</time>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="thread-input" onSubmit={handleSend}>
              <input
                placeholder="Votre message…"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sendLoading}
              />
              <button type="submit" className="primary-button" disabled={sendLoading || !newMessage.trim()}>
                <IonIcon iconName="send-outline" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
