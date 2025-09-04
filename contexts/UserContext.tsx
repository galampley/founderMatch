import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '@/types/user';
import { getCurrentUserProfile, upsertCurrentUserProfile } from '@/lib/profileService';
import { supabase } from '@/lib/supabaseClient';

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  isReady: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Load profile after session rehydration and react to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('UserContext init: session data:', data.session?.user?.id || 'no session');
        if (!mounted) return;
        if (data.session) {
          const profile = await getCurrentUserProfile();
          console.log('UserContext init: profile loaded:', profile);
          if (!mounted) return;
          setUser(profile);
        } else {
          console.log('UserContext init: no session, setting user to null');
          setUser(null);
        }
      } finally {
        if (mounted) setIsReady(true);
      }
    };
    init();

    // react to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('UserContext auth change:', event, session?.user?.id || 'no user');
      const profile = await getCurrentUserProfile();
      console.log('UserContext auth change: profile loaded:', profile);
      if (mounted) setUser(profile);
    });
    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    console.log('UserContext: Updating user with:', updates);
    console.log('UserContext: Current user before update:', user);
    
    // Get the current authenticated user ID
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id || '';
    
    setUser(prev => {
      if (!prev) {
        return { id: userId, name: '', age: 0, location: '', photos: [], prompts: [], basics: { height: '', education: '', jobTitle: '', religion: '', lookingFor: '' }, isOnboardingComplete: false, ...updates };
      }
      return { ...prev, id: userId, ...updates };
    });

    // Persist to Supabase (fire-and-forget)
    upsertCurrentUserProfile(updates).catch((error) => {
      console.error('Failed to save profile data:', error);
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, isReady }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}