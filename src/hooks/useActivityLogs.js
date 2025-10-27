import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useActivityLogs(userId) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchActivities();
    } else {
      setLoading(false);
      setActivities([]);
    }
  }, [userId]);

  async function fetchActivities() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function logActivity(action, meta = {}) {
    try {
      const { error } = await supabase
        .from('activity_logs')
        .insert([{
          user_id: userId,
          action,
          meta
        }]);

      if (error) throw error;
      await fetchActivities();
      return { success: true };
    } catch (error) {
      console.error('Error logging activity:', error);
      return { success: false, error: error.message };
    }
  }

  return {
    activities,
    loading,
    error,
    logActivity,
    refetch: fetchActivities
  };
}

