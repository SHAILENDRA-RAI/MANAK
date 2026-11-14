'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile, UserRole } from './types';
import { logAudit } from './audit';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organization?: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }

    return data as Profile | null;
  }

  async function ensureProfile(authUser: User): Promise<Profile> {
    let existing = await fetchProfile(authUser.id);

    if (existing) return existing;

    const email = authUser.email || '';

    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      email.split('@')[0];

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: authUser.id,
        email,
        full_name: fullName,
        role: 'valuer',
        organization: null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Profile creation error:', error);
      throw error;
    }

    return data as Profile;
  }

  async function refreshProfile() {
    if (!user) return;

    try {
      const result = await ensureProfile(user);
      setProfile(result);
    } catch (error) {
      console.error('Profile refresh error:', error);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        const currentSession = data.session;

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const result = await ensureProfile(currentSession.user);

          if (mounted) setProfile(result);
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (!currentSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(true);

        setTimeout(async () => {
          try {
            const result = await ensureProfile(currentSession.user);

            if (mounted) setProfile(result);

            if (event === 'SIGNED_IN') {
              await logAudit(
                currentSession.user.id,
                'login',
                'auth',
                currentSession.user.id
              );
            }
          } catch (error) {
            console.error('Authentication profile error:', error);
          } finally {
            if (mounted) setLoading(false);
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (!data.user) {
        return { error: 'Unable to authenticate user.' };
      }

      setSession(data.session);
      setUser(data.user);

      const result = await ensureProfile(data.user);
      setProfile(result);

      return { error: null };
    } catch (error) {
      console.error('Sign-in error:', error);

      return {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load your user profile.',
      };
    } finally {
      setLoading(false);
    }
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    organization?: string
  ) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization: organization || null,
        },
      },
    });

    if (error) return { error: error.message };

    return { error: null };
  }

  async function signOut() {
    if (user) {
      await logAudit(user.id, 'logout', 'auth', user.id);
    }

    await supabase.auth.signOut();

    setProfile(null);
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
