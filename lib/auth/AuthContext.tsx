'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, UserPreferences } from '@/lib/types';
import { loadLocalPreferences, saveLocalPreferences } from '@/lib/preferences';
import {
  localSignIn,
  localSignUp,
  localSignOut,
  getLocalSession,
  updateLocalAccountPreferences,
  updateLocalAccountProfile,
  updateLocalAccountOnboarding,
} from './authService';
import { setMemoryActiveUser } from '@/lib/services/memoryService';
import { setTaskActiveUser } from '@/lib/services/taskService';
import { setCareerActiveUser } from '@/lib/services/careerService';
import { setResearchActiveUser } from '@/lib/services/researchService';
import { setRagActiveUser } from '@/lib/services/ragService';

import {
  isGuestSession,
  startGuestSession,
  clearGuestSession,
  getGuestMessageCount,
  incrementGuestMessageCount,
  isGuestLimitReached,
  GUEST_MESSAGE_LIMIT,
} from './guestService';
import { recordAuthActivity } from '@/lib/services/activityService';

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  created_at?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: any | null;
  profile: UserProfile | null;
  preferences: UserPreferences;
  isLoading: boolean;
  isConfigured: boolean;
  isGuest: boolean;
  guestMessageCount: number;
  isGuestLimit: boolean;
  guestLimit: number;
  startGuest: () => void;
  clearGuest: () => void;
  incrementGuestCount: () => number;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  saveOnboardingPreferences: (prefs: {
    interests: string[];
    goals: string[];
    workStyle: string[];
    experienceLevel: string;
    customInstructions?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadLocalPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const configured = isSupabaseConfigured();

  const syncActiveUserServices = useCallback((userId: string | null) => {
    setMemoryActiveUser(userId);
    setTaskActiveUser(userId);
    setCareerActiveUser(userId);
    setResearchActiveUser(userId);
    setRagActiveUser(userId);
  }, []);

  const fetchProfile = useCallback(async (userId: string, userEmail: string, fallbackDisplayName?: string) => {
    if (configured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data && !error) {
          setProfile({
            id: data.id,
            email: data.email || userEmail,
            displayName: data.display_name || fallbackDisplayName || userEmail.split('@')[0],
            avatarUrl: data.avatar_url,
            role: data.role === 'admin' || userEmail.toLowerCase() === 'pooja@gmail.com' ? 'admin' : (data.role || 'user'),
            interests: Array.isArray(data.interests) ? data.interests : [],
            goals: Array.isArray(data.goals) ? data.goals : [],
            preferredResponseStyle: Array.isArray(data.preferred_response_style) ? data.preferred_response_style : [],
            experienceLevel: data.experience_level || 'Comfortable',
            onboardingCompleted: Boolean(data.onboarding_completed),
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });

          if (data.theme || data.accent_color || data.font_size || data.default_model) {
            const syncedPrefs: UserPreferences = {
              theme: data.theme || 'dark',
              accentColor: data.accent_color || 'purple',
              fontSize: data.font_size || 'normal',
              defaultModel: data.default_model || 'qwen/qwen3.6-27b',
              voiceName: data.voice_name,
              voiceRate: data.voice_rate ? parseFloat(data.voice_rate) : 1,
            };
            saveLocalPreferences(syncedPrefs);
            setPreferences(syncedPrefs);
          }
          return;
        } else {
          // Profile row does not exist yet (e.g. trigger delay or new user), ensure profile exists
          const defaultName = fallbackDisplayName || userEmail.split('@')[0];
          const defaultRole = userEmail.toLowerCase() === 'pooja@gmail.com' ? 'admin' : 'user';
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              email: userEmail,
              display_name: defaultName,
              role: defaultRole,
              onboarding_completed: false,
              updated_at: new Date().toISOString(),
            })
            .select('*')
            .maybeSingle();

          if (newProfile && !insertError) {
            setProfile({
              id: newProfile.id,
              email: newProfile.email || userEmail,
              displayName: newProfile.display_name || defaultName,
              avatarUrl: newProfile.avatar_url,
              role: newProfile.role === 'admin' || userEmail.toLowerCase() === 'pooja@gmail.com' ? 'admin' : (newProfile.role || 'user'),
              interests: [],
              goals: [],
              preferredResponseStyle: [],
              experienceLevel: 'Comfortable',
              onboardingCompleted: false,
              createdAt: newProfile.created_at,
              updatedAt: newProfile.updated_at,
            });
            return;
          }
        }
      } catch (e) {
        console.warn('Profile fetch or ensure skipped/failed:', e);
      }
    }

    // Default profile for local auth or fallback
    let localOnboarding: any = {};
    if (typeof window !== 'undefined') {
      try {
        const rawAccounts = localStorage.getItem('nyra_accounts_store');
        if (rawAccounts) {
          const accounts = JSON.parse(rawAccounts);
          const found = accounts.find((a: any) => a.id === userId);
          if (found) localOnboarding = found;
        }
      } catch {}
    }

    setProfile({
      id: userId,
      email: userEmail,
      displayName: fallbackDisplayName || userEmail.split('@')[0],
      role: localOnboarding.role || (userEmail.toLowerCase() === 'pooja@gmail.com' ? 'admin' : 'user'),
      interests: localOnboarding.interests || [],
      goals: localOnboarding.goals || [],
      preferredResponseStyle: localOnboarding.preferredResponseStyle || [],
      experienceLevel: localOnboarding.experienceLevel || 'Comfortable',
      onboardingCompleted: Boolean(localOnboarding.onboardingCompleted),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [configured]);

  useEffect(() => {
    async function initAuth() {
      if (configured) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession?.user) {
            setSession(currentSession);
            const authUser: AuthUser = {
              id: currentSession.user.id,
              email: currentSession.user.email,
              user_metadata: currentSession.user.user_metadata,
              created_at: currentSession.user.created_at,
            };
            setUser(authUser);
            syncActiveUserServices(authUser.id);
            await fetchProfile(
              authUser.id,
              authUser.email || '',
              authUser.user_metadata?.display_name
            );
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase session init check failed:', e);
        }
      }

      // Check local session ONLY if Supabase returned no session or is unconfigured
      const localSess = getLocalSession();
      if (localSess && localSess.user) {
        setSession(localSess);
        const authUser: AuthUser = {
          id: localSess.user.id,
          email: localSess.user.email,
          user_metadata: {
            display_name: localSess.user.displayName,
            avatar_url: localSess.user.avatarUrl,
          },
          created_at: localSess.user.createdAt,
        };
        setUser(authUser);
        syncActiveUserServices(authUser.id);
        setProfile({
          id: authUser.id,
          email: authUser.email || '',
          displayName: localSess.user.displayName || authUser.email?.split('@')[0] || 'User',
          avatarUrl: localSess.user.avatarUrl,
          createdAt: authUser.created_at,
          updatedAt: authUser.created_at,
        });
      } else {
        syncActiveUserServices(null);
      }

      const guestActive = isGuestSession();
      setIsGuest(guestActive);
      setGuestCount(getGuestMessageCount());

      setIsLoading(false);
    }

    initAuth();

    if (configured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          const authUser: AuthUser = {
            id: newSession.user.id,
            email: newSession.user.email,
            user_metadata: newSession.user.user_metadata,
            created_at: newSession.user.created_at,
          };
          setUser(authUser);
          clearGuestSession();
          setIsGuest(false);
          syncActiveUserServices(authUser.id);
          await fetchProfile(
            authUser.id,
            authUser.email || '',
            authUser.user_metadata?.display_name
          );
        } else {
          // If Supabase signed out, clear auth state
          const localSess = !configured ? getLocalSession() : null;
          if (!localSess) {
            setUser(null);
            setSession(null);
            setProfile(null);
            syncActiveUserServices(null);
          }
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [configured, fetchProfile, syncActiveUserServices]);

  const startGuest = useCallback(() => {
    startGuestSession();
    setIsGuest(true);
    setGuestCount(getGuestMessageCount());
    recordAuthActivity({ eventType: 'guest_started', provider: 'guest' });
  }, []);

  const clearGuest = useCallback(() => {
    clearGuestSession();
    setIsGuest(false);
    setGuestCount(0);
  }, []);

  const incrementGuestCount = useCallback((): number => {
    const next = incrementGuestMessageCount();
    setGuestCount(next);
    if (next >= GUEST_MESSAGE_LIMIT) {
      recordAuthActivity({ eventType: 'guest_limit_reached', provider: 'guest' });
    }
    return next;
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (configured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          let userFriendlyError = error.message;
          const msgLower = error.message.toLowerCase();
          if (msgLower.includes('invalid login credentials') || msgLower.includes('invalid credentials')) {
            userFriendlyError = 'Invalid email or password. Please try again.';
          } else if (msgLower.includes('email not confirmed')) {
            userFriendlyError = 'Email confirmation is enabled in your Supabase project. In Supabase Dashboard -> Authentication -> Providers -> Email, switch "Confirm email" to OFF.';
          } else if (msgLower.includes('user not found') || msgLower.includes('no user')) {
            userFriendlyError = 'No account found with this email. Please create an account.';
          }
          recordAuthActivity({ eventType: 'failed_login', email: cleanEmail, provider: 'email' });
          return { success: false, error: userFriendlyError };
        }

        if (data.user && data.session) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            user_metadata: data.user.user_metadata,
            created_at: data.user.created_at,
          };
          clearGuestSession();
          setIsGuest(false);
          setUser(authUser);
          setSession(data.session);
          syncActiveUserServices(authUser.id);
          await fetchProfile(data.user.id, data.user.email || cleanEmail, data.user.user_metadata?.display_name);
          recordAuthActivity({ eventType: 'login', userId: authUser.id, email: authUser.email, provider: 'email' });
          return { success: true };
        }

        return { success: false, error: 'Sign in failed. No active session returned.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'An error occurred during sign in.' };
      }
    }

    // Local authentication fallback ONLY when Supabase is not configured
    const localRes = await localSignIn(cleanEmail, password);
    if (localRes.success && localRes.user) {
      const authUser: AuthUser = {
        id: localRes.user.id,
        email: localRes.user.email,
        user_metadata: {
          display_name: localRes.user.displayName,
          avatar_url: localRes.user.avatarUrl,
        },
        created_at: localRes.user.createdAt,
      };
      clearGuestSession();
      setIsGuest(false);
      setUser(authUser);
      setSession(getLocalSession());
      syncActiveUserServices(authUser.id);
      setProfile({
        id: authUser.id,
        email: authUser.email || '',
        displayName: localRes.user.displayName,
        avatarUrl: localRes.user.avatarUrl,
        createdAt: authUser.created_at,
        updatedAt: authUser.created_at,
      });
      recordAuthActivity({ eventType: 'login', userId: authUser.id, email: authUser.email, provider: 'local' });
      return { success: true };
    }

    return { success: false, error: localRes.error || 'Invalid credentials or user not found.' };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanDisplayName = displayName?.trim() || cleanEmail.split('@')[0];

    if (configured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              display_name: cleanDisplayName,
            },
          },
        });

        if (error) {
          let errorMsg = error.message;
          const msgLower = error.message.toLowerCase();
          if (msgLower.includes('already registered') || msgLower.includes('already exists')) {
            errorMsg = 'An account with this email already exists. Please log in instead.';
          }
          return { success: false, error: errorMsg };
        }

        if (data.user) {
          // Supabase returns identities: [] if user already exists
          if (data.user.identities && data.user.identities.length === 0) {
            return {
              success: false,
              error: 'An account with this email already exists. Please log in instead.',
            };
          }

          let authSession = data.session;

          // If session was not immediately returned by signUp, attempt instant signIn
          if (!authSession) {
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password,
            });
            if (signInData?.session) {
              authSession = signInData.session;
            } else if (signInErr) {
              const signInMsg = signInErr.message.toLowerCase();
              if (signInMsg.includes('email not confirmed')) {
                return {
                  success: false,
                  error: 'Email confirmation is enabled in your Supabase project. In Supabase Dashboard -> Authentication -> Providers -> Email, switch "Confirm email" to OFF to allow instant signup and login.',
                };
              }
              return {
                success: false,
                error: signInErr.message || 'Account created but sign-in session could not be established.',
              };
            }
          }

          if (authSession) {
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              user_metadata: data.user.user_metadata,
              created_at: data.user.created_at,
            };
            clearGuestSession();
            setIsGuest(false);
            setUser(authUser);
            setSession(authSession);
            syncActiveUserServices(authUser.id);
            await fetchProfile(data.user.id, data.user.email || cleanEmail, cleanDisplayName);
            recordAuthActivity({ eventType: 'signup', userId: authUser.id, email: authUser.email, provider: 'email' });
            return { success: true };
          }

          return {
            success: false,
            error: 'Registration succeeded but no active session was returned. Please disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email -> Confirm email: OFF).',
          };
        }

        return { success: false, error: 'Registration failed. Please try again.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'An error occurred during registration.' };
      }
    }

    // Local Account Creation fallback ONLY when Supabase is not configured
    const localRes = await localSignUp(cleanEmail, password, cleanDisplayName);
    if (localRes.success && localRes.user) {
      const authUser: AuthUser = {
        id: localRes.user.id,
        email: localRes.user.email,
        user_metadata: {
          display_name: localRes.user.displayName,
          avatar_url: localRes.user.avatarUrl,
        },
        created_at: localRes.user.createdAt,
      };
      clearGuestSession();
      setIsGuest(false);
      setUser(authUser);
      setSession(getLocalSession());
      syncActiveUserServices(authUser.id);
      setProfile({
        id: authUser.id,
        email: authUser.email || '',
        displayName: localRes.user.displayName,
        avatarUrl: localRes.user.avatarUrl,
        createdAt: authUser.created_at,
        updatedAt: authUser.created_at,
      });
      recordAuthActivity({ eventType: 'signup', userId: authUser.id, email: authUser.email, provider: 'local' });
      return { success: true };
    }

    return { success: false, error: localRes.error || 'Failed to create account.' };
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (configured) {
      try {
        const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : undefined;
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data?.url && typeof window !== 'undefined') {
          window.location.href = data.url;
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Google authentication failed' };
      }
    }
    return {
      success: false,
      error: 'Google authentication requires Supabase to be configured with Google OAuth provider credentials in your project dashboard.',
    };
  };

  const signOut = async () => {
    if (user) {
      recordAuthActivity({ eventType: 'logout', userId: user.id, email: user.email, provider: 'email' });
    }
    if (configured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    localSignOut();
    clearGuestSession();
    setIsGuest(false);
    setGuestCount(0);
    setUser(null);
    setSession(null);
    setProfile(null);
    syncActiveUserServices(null);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updated = saveLocalPreferences(prefs);
    setPreferences(updated);

    if (user) {
      updateLocalAccountPreferences(user.id, prefs);
      if (configured) {
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
    }
  };

  const saveOnboardingPreferences = async (prefs: {
    interests: string[];
    goals: string[];
    workStyle: string[];
    experienceLevel: string;
    customInstructions?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    // Persist to local storage for instant access across components & guests
    try {
      localStorage.setItem('nyra_onboarding_prefs', JSON.stringify({
        interests: prefs.interests,
        goals: prefs.goals,
        preferredResponseStyle: prefs.workStyle,
        experienceLevel: prefs.experienceLevel,
        customInstructions: prefs.customInstructions,
        onboardingCompleted: true,
      }));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    // Update local profile state immediately
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            interests: prefs.interests,
            goals: prefs.goals,
            preferredResponseStyle: prefs.workStyle,
            experienceLevel: prefs.experienceLevel,
            customInstructions: prefs.customInstructions,
            onboardingCompleted: true,
          }
        : {
            id: 'guest',
            email: 'guest@nyra.ai',
            displayName: 'Guest User',
            role: 'user',
            interests: prefs.interests,
            goals: prefs.goals,
            preferredResponseStyle: prefs.workStyle,
            experienceLevel: prefs.experienceLevel,
            customInstructions: prefs.customInstructions,
            onboardingCompleted: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
    );

    if (user) {
      // Persist to local accounts storage
      updateLocalAccountOnboarding(user.id, {
        interests: prefs.interests,
        goals: prefs.goals,
        preferredResponseStyle: prefs.workStyle,
        experienceLevel: prefs.experienceLevel,
        customInstructions: prefs.customInstructions,
        onboardingCompleted: true,
      });

      // Persist to Supabase if configured
      if (configured) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              interests: prefs.interests,
              goals: prefs.goals,
              preferred_response_style: prefs.workStyle,
              experience_level: prefs.experienceLevel,
              onboarding_completed: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            console.warn('Failed to persist onboarding preferences to Supabase:', error);
          }
        } catch (err) {
          console.warn('Supabase onboarding update exception:', err);
        }
      }
    }

    return { success: true };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email || '', user.user_metadata?.display_name);
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
        isGuest,
        guestMessageCount: guestCount,
        isGuestLimit: isGuest && guestCount >= GUEST_MESSAGE_LIMIT,
        guestLimit: GUEST_MESSAGE_LIMIT,
        startGuest,
        clearGuest,
        incrementGuestCount,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        updatePreferences,
        saveOnboardingPreferences,
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
