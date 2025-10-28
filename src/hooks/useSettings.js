import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category, label');

      if (error) {
        throw error;
      }
      
      
      setSettings(data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateSetting(key, value) {
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;
      
      // Update local state
      setSettings(prev => prev.map(s => 
        s.key === key ? { ...s, value } : s
      ));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function updateMultipleSettings(updates) {
    try {
      const updatesArray = Object.entries(updates).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString()
      }));

      // Update each setting individually
      const promises = updatesArray.map(({ key, value, updated_at }) =>
        supabase
          .from('settings')
          .update({ value, updated_at })
          .eq('key', key)
      );

      const results = await Promise.all(promises);
      
      // Check for errors
      const hasError = results.some(result => result.error);
      if (hasError) {
        throw new Error('Failed to update some settings');
      }

      // Update local state
      setSettings(prev => prev.map(setting => {
        const update = updatesArray.find(u => u.key === setting.key);
        return update ? { ...setting, value: update.value } : setting;
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Helper to get setting by key
  const getSetting = useCallback((key) => {
    return settings.find(s => s.key === key);
  }, [settings]);

  // Helper to get setting value by key
  const getSettingValue = useCallback((key, defaultValue = '') => {
    const setting = getSetting(key);
    return setting ? setting.value : defaultValue;
  }, [getSetting]);

  return { 
    settings, 
    loading, 
    error, 
    refetch: fetchSettings,
    updateSetting,
    updateMultipleSettings,
    getSetting,
    getSettingValue
  };
}

