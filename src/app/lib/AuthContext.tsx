import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, apiRequest } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadOrCreateProfile(session);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadOrCreateProfile(session);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateProfile = async (session: Session) => {
    try {
      // Try to load existing profile
      const response = await apiRequest('/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.profile) {
        console.log('Profile loaded:', response.profile);
        setProfile(response.profile);
      } else {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', session.user.email);
        const newProfile = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString()
        };

        const createResponse = await apiRequest('/profile', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify(newProfile),
        });

        if (createResponse.profile) {
          console.log('Profile created:', createResponse.profile);
          setProfile(createResponse.profile);
        }
      }
    } catch (error) {
      console.error('Error loading/creating profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (!session) return;
    await loadOrCreateProfile(session);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
