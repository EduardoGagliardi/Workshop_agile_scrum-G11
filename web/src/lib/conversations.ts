import { supabase } from './supabaseClient'

export async function findOrCreateConversation(
  currentUserId: string,
  targetUserId: string,
): Promise<string | null> {
  if (currentUserId === targetUserId) return null

  const { data: myParticipations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', currentUserId)

  const myConversationIds = new Set(
    (myParticipations ?? []).map((row: { conversation_id: string }) => row.conversation_id),
  )

  if (myConversationIds.size > 0) {
    const { data: sharedParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', targetUserId)
      .in('conversation_id', [...myConversationIds])

    const existingConversationId = sharedParticipations?.[0]?.conversation_id as string | undefined
    if (existingConversationId) return existingConversationId
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .insert({})
    .select('id')
    .single()

  if (!conversation) return null

  const { error } = await supabase.from('conversation_participants').insert([
    { conversation_id: conversation.id, user_id: currentUserId },
    { conversation_id: conversation.id, user_id: targetUserId },
  ])

  if (error) return null
  return conversation.id as string
}
