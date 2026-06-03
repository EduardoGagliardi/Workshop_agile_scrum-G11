import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useNotificationsRealtime(userId: string, onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`notifications-live:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_user_id=eq.${userId}`,
        },
        () => onChange(),
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_user_id=eq.${userId}`,
        },
        () => onChange(),
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_registrations' },
        () => onChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onChange])
}
