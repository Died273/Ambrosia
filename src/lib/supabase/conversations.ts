import { createClient } from '@/lib/supabase/client';
import type { ChatMessage, Conversation } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Database row types for conversations and messages
 */
interface ConversationRow {
  id: string;
  match_id: string;
  participant_1_id: string;
  participant_2_id: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  read_at: string | null;
}

/**
 * Get or create a conversation for a match
 * @param matchId - The match ID
 * @param userId1 - First participant ID
 * @param userId2 - Second participant ID
 * @returns Conversation object with messages
 */
export async function getOrCreateConversation(
  matchId: string,
  userId1: string,
  userId2: string
): Promise<Conversation> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  // Try to find existing conversation (also check legacy asymmetric match IDs)
  const legacyMatchId1 = `match-${userId1}-${userId2}`;
  const legacyMatchId2 = `match-${userId2}-${userId1}`;
  const { data: allExisting, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .or(`match_id.eq.${matchId},match_id.eq.${legacyMatchId1},match_id.eq.${legacyMatchId2}`)
    .order('created_at', { ascending: true });

  let conversationRow: ConversationRow;

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = not found, which is ok
    throw new Error(`Failed to fetch conversation: ${fetchError.message}`);
  }

  if (allExisting && allExisting.length > 0) {
    // Use the first (oldest) conversation as the canonical one
    conversationRow = allExisting[0] as ConversationRow;

    // Migrate legacy match_id to canonical form
    if (conversationRow.match_id !== matchId) {
      await supabase
        .from('conversations')
        .update({ match_id: matchId })
        .eq('id', conversationRow.id);
      conversationRow.match_id = matchId;
    }

    // Clean up duplicate conversations (move their messages to the canonical one, then delete)
    if (allExisting.length > 1) {
      for (let i = 1; i < allExisting.length; i++) {
        const duplicate = allExisting[i] as ConversationRow;
        // Move messages from duplicate to canonical conversation
        await supabase
          .from('messages')
          .update({ conversation_id: conversationRow.id })
          .eq('conversation_id', duplicate.id);
        // Delete the duplicate conversation
        await supabase
          .from('conversations')
          .delete()
          .eq('id', duplicate.id);
      }
    }
  } else {
    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        match_id: matchId,
        participant_1_id: userId1,
        participant_2_id: userId2
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create conversation: ${createError.message}`);
    }

    conversationRow = newConv as ConversationRow;
  }

  // Fetch messages for this conversation
  const messages = await getConversationMessages(conversationRow.id);

  return {
    id: conversationRow.id,
    matchId: conversationRow.match_id,
    participantIds: [conversationRow.participant_1_id, conversationRow.participant_2_id],
    messages,
    createdAt: new Date(conversationRow.created_at).getTime()
  };
}

/**
 * Get all messages for a conversation
 * @param conversationId - The conversation ID
 * @returns Array of chat messages
 */
export async function getConversationMessages(
  conversationId: string
): Promise<ChatMessage[]> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return (data as MessageRow[]).map(row => ({
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: new Date(row.created_at).getTime()
  }));
}

/**
 * Send a message in a conversation
 * @param conversationId - The conversation ID
 * @param senderId - The sender's user ID
 * @param text - The message text
 * @returns The created message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<ChatMessage> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Message cannot be empty');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      text: trimmedText
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  const row = data as MessageRow;

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.text,
    timestamp: new Date(row.created_at).getTime()
  };
}

/**
 * Get all conversations for a user
 * @param userId - The user's ID
 * @returns Array of conversations with last message info
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  const conversations: Conversation[] = [];

  for (const row of (data as ConversationRow[])) {
    const messages = await getConversationMessages(row.id);
    conversations.push({
      id: row.id,
      matchId: row.match_id,
      participantIds: [row.participant_1_id, row.participant_2_id],
      messages,
      createdAt: new Date(row.created_at).getTime()
    });
  }

  return conversations;
}

/**
 * Subscribe to new messages in a conversation
 * @param conversationId - The conversation ID
 * @param onMessage - Callback when new message arrives
 * @returns Realtime channel to unsubscribe later
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: ChatMessage) => void
): RealtimeChannel | null {
  const supabase = createClient();
  if (!supabase) {
    console.warn('Supabase client not available for realtime');
    return null;
  }

  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        const row = payload.new as MessageRow;
        onMessage({
          id: row.id,
          conversationId: row.conversation_id,
          senderId: row.sender_id,
          text: row.text,
          timestamp: new Date(row.created_at).getTime()
        });
      }
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 * @param channel - The channel to unsubscribe from
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel) {
  const supabase = createClient();
  if (!supabase) return;

  await supabase.removeChannel(channel);
}
