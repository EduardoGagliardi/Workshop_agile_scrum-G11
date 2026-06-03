import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useSessionChatRealtime(sessionId: string, onMessageChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`session-chat:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        () => onMessageChange(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, onMessageChange])
}
