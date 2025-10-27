import { useState, useEffect } from 'react';
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
      console.log('Fetching settings from Supabase...');
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category, label');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Settings loaded:', data?.length, 'items');
      console.log('Settings data:', data);
      
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
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
      console.error('Error updating setting:', error);
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
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper to get setting by key
  function getSetting(key) {
    return settings.find(s => s.key === key);
  }

  // Helper to get setting value by key
  function getSettingValue(key, defaultValue = '') {
    const setting = getSetting(key);
    return setting ? setting.value : defaultValue;
  }

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

