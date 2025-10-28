import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        return null;
      } else if (data) {
        setProfile(data);
        return data;
      }
      setLoading(false);
      return null;
    } catch (error) {
      setLoading(false);
      return null;
    }
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // Create user profile after signup
      if (data.user) {
        const profileData = {
          user_id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          created_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([profileData]);

        if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
          // Profile might already exist, fetch it
          await fetchProfile(data.user.id);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Ensure profile exists
      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        if (!profileData) {
          // Create profile if doesn't exist
          await supabase
            .from('user_profiles')
            .insert([{
              user_id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
            }]);
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

