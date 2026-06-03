import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export type MessagePreview = {
  conversationId: string
  senderName: string
  preview: string
  time: string
}

export type NotificationPreview = {
  id: string
  title: string
  body: string
  time: string
}

type ParticipantRow = {
  conversation_id: string
  user_id: string
  users: { first_name: string; last_name: string } | null
}

type MessageRow = {
  conversation_id: string
  content: string
  created_at: string
  sender_user_id: string
}

export function useDashboardAlerts(userId: string) {
  const [messagePreviews, setMessagePreviews] = useState<MessagePreview[]>([])
  const [notificationPreviews, setNotificationPreviews] = useState<NotificationPreview[]>([])
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  const fetchMessagePreviews = useCallback(async () => {
    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)

    const conversationIds = (participations ?? []).map(
      (row: { conversation_id: string }) => row.conversation_id,
    )

    if (conversationIds.length === 0) {
      setMessagePreviews([])
      setUnreadMessageCount(0)
      return
    }

    const [{ data: participants }, { data: lastMessages }] = await Promise.all([
      supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, users(first_name, last_name)')
        .in('conversation_id', conversationIds)
        .neq('user_id', userId),
      supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_user_id')
        .in('conversation_id', conversationIds)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false }),
    ])

    const previews: MessagePreview[] = []
    let unreadCount = 0

    for (const conversationId of conversationIds) {
      const otherParticipant = (participants as unknown as ParticipantRow[] | null)?.find(
        (participant) => participant.conversation_id === conversationId,
      )
      const lastMessage = (lastMessages as MessageRow[] | null)?.find(
        (message) => message.conversation_id === conversationId,
      )

      if (!otherParticipant?.users) continue

      const senderName = `${otherParticipant.users.first_name} ${otherParticipant.users.last_name}`

      if (lastMessage) {
        if (lastMessage.sender_user_id !== userId) unreadCount += 1
        previews.push({
          conversationId,
          senderName,
          preview: lastMessage.content,
          time: lastMessage.created_at,
        })
      } else {
        previews.push({
          conversationId,
          senderName,
          preview: 'Nouvelle conversation',
          time: '',
        })
      }
    }

    previews.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())

    setMessagePreviews(previews.slice(0, 8))
    setUnreadMessageCount(unreadCount)
  }, [userId])

  const fetchNotificationPreviews = useCallback(async () => {
    const { data: hostedSessions } = await supabase
      .from('sessions')
      .select('id')
      .eq('host_id', userId)

    const hostedSessionIds = (hostedSessions ?? []).map((session: { id: string }) => session.id)

    const [{ data: contactRequests }, { data: registrations }] = await Promise.all([
      supabase
        .from('contact_requests')
        .select('id, created_at, users!sender_user_id(first_name, last_name)')
        .eq('receiver_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      hostedSessionIds.length > 0
        ? supabase
            .from('session_registrations')
            .select('session_id, registered_at, sessions(title), users!user_id(first_name, last_name)')
            .in('session_id', hostedSessionIds)
            .order('registered_at', { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] }),
    ])

    const previews: NotificationPreview[] = []

    for (const request of contactRequests ?? []) {
      const sender = request.users as unknown as { first_name: string; last_name: string } | null
      previews.push({
        id: `contact-${request.id}`,
        title: 'Demande de contact',
        body: sender
          ? `${sender.first_name} ${sender.last_name} souhaite vous ajouter.`
          : 'Nouvelle demande de contact.',
        time: request.created_at,
      })
    }

    type SessionRegistrationPreview = {
      session_id: string
      registered_at: string
      users: { first_name: string; last_name: string } | null
      sessions: { title: string } | null
    }

    for (const registration of (registrations ?? []) as unknown as SessionRegistrationPreview[]) {
      const attendee = registration.users
      const session = registration.sessions
      previews.push({
        id: `session-${registration.session_id}-${registration.registered_at}`,
        title: 'Inscription à une session',
        body: attendee && session
          ? `${attendee.first_name} ${attendee.last_name} s'est inscrit(e) à ${session.title}.`
          : 'Nouvelle inscription à votre session.',
        time: registration.registered_at,
      })
    }

    previews.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    setNotificationPreviews(previews)
    setNotificationCount(previews.length)
  }, [userId])

  const refresh = useCallback(async () => {
    await Promise.all([fetchMessagePreviews(), fetchNotificationPreviews()])
  }, [fetchMessagePreviews, fetchNotificationPreviews])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const channel = supabase
      .channel(`dashboard-alerts:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchMessagePreviews()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_user_id=eq.${userId}`,
        },
        () => {
          fetchNotificationPreviews()
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_user_id=eq.${userId}`,
        },
        () => {
          fetchNotificationPreviews()
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_registrations' },
        () => {
          fetchNotificationPreviews()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, fetchMessagePreviews, fetchNotificationPreviews])

  return {
    messagePreviews,
    notificationPreviews,
    unreadMessageCount,
    notificationCount,
    refresh,
  }
}
