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
          console.log('UserContext init: creating empty profile for user:', data.session.user.id);
          const emptyProfile = {
            id: data.session.user.id,
            name: '',
            age: 0,
            location: '',
            photos: [],
            prompts: [],
            basics: { height: '', education: '', jobTitle: '', religion: '', lookingFor: '' },
            isOnboardingComplete: false,
          };
          if (!mounted) return;
          setUser(emptyProfile);
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
      if (session?.user?.id) {
        const emptyProfile = {
          id: session.user.id,
          name: '',
          age: 0,
          location: '',
          photos: [],
          prompts: [],
          basics: { height: '', education: '', jobTitle: '', religion: '', lookingFor: '' },
          isOnboardingComplete: false,
        };
        if (mounted) setUser(emptyProfile);
      } else {
        if (mounted) setUser(null);
      }
    });
    return () => { mounted = false; sub.subscription?.unsubscribe(); };
  }, []);

  const updateUser = async (updates: Partial<UserProfile>) => {
    console.log('UserContext: Updating user with:', updates);
    console.log('UserContext: Current user before update:', user);
    
    // Get the current authenticated user ID
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    console.log('UserContext: Auth user ID:', userId);
    
    if (!userId) {
      console.error('UserContext: No authenticated user found');
      return;
    }
    
    // Update local state
    setUser(prev => {
      if (!prev) {
        return { id: userId, name: '', age: 0, location: '', photos: [], prompts: [], basics: { height: '', education: '', jobTitle: '', religion: '', lookingFor: '' }, isOnboardingComplete: false, ...updates };
      }
      return { ...prev, id: userId, ...updates };
    });

    // Persist directly to Supabase
    try {
      const row: Record<string, unknown> = { id: userId };
      if (typeof updates.name !== 'undefined') row.name = updates.name;
      if (typeof updates.age !== 'undefined') row.age = updates.age;
      if (typeof updates.location !== 'undefined') row.location = updates.location;
      if (typeof updates.photos !== 'undefined') row.photos = updates.photos;
      if (typeof updates.prompts !== 'undefined') row.prompts = updates.prompts;
      if (typeof updates.basics !== 'undefined') row.basics = updates.basics;
      if (typeof updates.isOnboardingComplete !== 'undefined') {
        row.is_onboarding_complete = updates.isOnboardingComplete;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Failed to save profile data:', error);
      } else {
        console.log('Profile data saved successfully');
      }
    } catch (error) {
      console.error('Failed to save profile data:', error);
    }
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