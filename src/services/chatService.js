import { supabase } from '../lib/supabase';
import { io } from 'socket.io-client';

// Initialize Socket.io connection
const socket = io('http://localhost:3002', {
  transports: ['websocket'],
  reconnection: true
});

export const chatService = {
  socket,

  // Create new conversation
  async createConversation(userId, subject = 'Customer Support') {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{
          user_id: userId,
          status: 'open',
          subject
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get user's conversations
  async getConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get messages for a conversation
  async getMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Send message
  async sendMessage(conversationId, senderId, message, senderType = 'user') {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          is_read: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Update conversation's last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Emit socket event
      socket.emit('new_message', {
        conversationId,
        message: data
      });

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Mark messages as read
  async markAsRead(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Connect to real-time updates
  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
  },

  // Disconnect
  unsubscribe(channel) {
    return supabase.removeChannel(channel);
  }
};

