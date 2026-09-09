'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserPreferences } from '@/lib/types';
import { loadLocalPreferences, saveLocalPreferences } from '@/lib/preferences';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(loadLocalPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const configured = isSupabaseConfigured();

  const fetchProfile = useCallback(async (userId: string, userEmail: string) => {
    if (!configured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email || userEmail,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });

        // Sync remote preferences if present
        if (data.theme || data.accent_color || data.font_size || data.default_model) {
          const syncedPrefs: UserPreferences = {
            theme: data.theme || 'dark',
            accentColor: data.accent_color || 'blue',
            fontSize: data.font_size || 'normal',
            defaultModel: data.default_model || 'qwen/qwen3.6-27b',
            voiceName: data.voice_name,
            voiceRate: data.voice_rate ? parseFloat(data.voice_rate) : 1,
          };
          saveLocalPreferences(syncedPrefs);
          setPreferences(syncedPrefs);
        }
      }
    } catch (e) {
      console.warn('Profile fetch skipped or failed:', e);
    }
  }, [configured]);

  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.email || '');
      }
      setIsLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured, fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!configured) {
      return { success: false, error: 'Supabase credentials not configured in .env.local' };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        await fetchProfile(data.user.id, data.user.email || email);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!configured) {
      return { success: false, error: 'Supabase credentials not configured in .env.local' };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const signOut = async () => {
    if (configured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updated = saveLocalPreferences(prefs);
    setPreferences(updated);

    if (configured && user) {
      try {
        await supabase.from('profiles').update({
          theme: updated.theme,
          accent_color: updated.accentColor,
          font_size: updated.fontSize,
          default_model: updated.defaultModel,
          voice_name: updated.voiceName,
          voice_rate: updated.voiceRate,
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);
      } catch (err) {
        console.warn('Failed to sync preferences to Supabase:', err);
      }
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        preferences,
        isLoading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        updatePreferences,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
