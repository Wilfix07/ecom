import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      fetchSettings();
    } else {
      setLoading(false);
      setNotifications([]);
      setSettings(null);
    }
  }, [userId]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create default settings if not exists
        const { data: newSettings, error: insertError } = await supabase
          .from('notification_settings')
          .insert([{ user_id: userId }])
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  }

  async function markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  async function markAllAsRead() {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error: error.message };
    }
  }

  async function updateSettings(newSettings) {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update({
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      setSettings({ ...settings, ...newSettings });
      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return { success: false, error: error.message };
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    settings,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateSettings,
    refetch: fetchNotifications
  };
}

