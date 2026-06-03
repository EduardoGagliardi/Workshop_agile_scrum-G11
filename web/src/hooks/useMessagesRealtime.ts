import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMessagesRealtime(userId: string, onMessageChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`messages-live:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as { is_deleted: boolean }
          if (row.is_deleted) return
          onMessageChange()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, onMessageChange])
}
