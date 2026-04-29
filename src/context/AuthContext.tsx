'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'customer' | 'admin' | 'supplier';
  phone?: string;
  loyalty_points?: number;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile from database
  const loadUserProfile = async (userId: string) => {
    try {
      console.log('📂 Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, that's not necessarily fatal
        if (error.code === 'PGRST116') {
          console.log('ℹ️ User profile not found in database (this is OK for new users)');
          return null;
        }
        console.warn('⚠️ Could not load user profile:', error.message);
        return null;
      }

      if (!data) {
        console.log('ℹ️ No profile data returned');
        return null;
      }

      console.log('✅ Profile loaded successfully');
      setProfile(data as UserProfile);
      return data;
    } catch (err) {
      console.error('❌ Error loading user profile:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user.id);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          await loadUserProfile(currentSession.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    isAdmin: profile?.role === 'admin',
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { UserProfile };
