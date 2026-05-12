'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// User context
interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  banner_url?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfileData = useCallback(async (userId: string, email: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, banner_url')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Profile fetch error (might not exist yet):', error.message);
        return null;
      }

      if (profile) {
        return {
          id: userId,
          email: email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          banner_url: profile.banner_url,
        };
      }
    } catch (err) {
      console.error('Error in fetchProfileData:', err);
    }
    return null;
  }, []);

  const ensureProfileExists = useCallback(async (userId: string, email: string, fullName?: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!profile) {
        console.log('Profile missing, creating one for:', email);
        await supabase.from('profiles').insert({
          id: userId,
          email: email,
          full_name: fullName || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error ensuring profile exists:', err);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const profileData = await fetchProfileData(authUser.id, authUser.email || '');
      if (profileData) {
        setUser(profileData);
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
        });
      }
    }
  }, [fetchProfileData]);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          const authUser = session.user;

          // Optimistically set from session metadata immediately
          if (mounted) {
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name,
              avatar_url: authUser.user_metadata?.avatar_url,
            });
          }

          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            await ensureProfileExists(authUser.id, authUser.email || '', authUser.user_metadata?.full_name);
          }

          const profileData = await fetchProfileData(authUser.id, authUser.email || '');
          if (profileData && mounted) {
            setUser(profileData);
          }
        } else if (mounted) {
          setUser(null);
        }

        if (mounted) {
          setInitialized(true);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileData, ensureProfileExists]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading: !initialized || loading,
    signOut,
    refreshUser
  }), [user, initialized, loading, signOut, refreshUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
 