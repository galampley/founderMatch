import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserProfile } from '@/types/user';
import { getCurrentUserProfile, upsertCurrentUserProfile } from '@/lib/profileService';
import { supabase } from '@/lib/supabaseClient';

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load profile on session
  useEffect(() => {
    const init = async () => {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    };
    init();

    // react to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    });
    return () => { sub.subscription?.unsubscribe(); };
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    console.log('UserContext: Updating user with:', updates);
    console.log('UserContext: Current user before update:', user);
    
    setUser(prev => {
      if (!prev) {
        return { id: '', name: '', age: 0, location: '', photos: [], prompts: [], basics: { height: '', education: '', jobTitle: '', religion: '', lookingFor: '' }, isOnboardingComplete: false, ...updates };
      }
      return { ...prev, ...updates };
    });

    // Persist to Supabase (fire-and-forget)
    upsertCurrentUserProfile(updates).catch(() => {});
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser }}>
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