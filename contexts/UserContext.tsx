import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/user';
import { getCurrentUserProfile, upsertCurrentUserProfile } from '@/lib/profileService';
import { supabase } from '@/lib/supabaseClient';
import { getLocalSession, clearLocalSession, saveLocalSession } from '@/lib/sessionUtils';

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const buildPlaceholderProfile = (userId: string): UserProfile => ({
  id: userId,
  name: '',
  age: 0,
  location: '',
  photos: [],
  prompts: [],
  basics: {
    height: '',
    education: '',
    jobTitle: '',
    religion: '',
    lookingFor: '',
  },
  isOnboardingComplete: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (loading) return; // Prevent concurrent refreshes
    
    setLoading(true);
    try {
      const session = getLocalSession();
      
      if (session?.user) {
          const profile = await getCurrentUserProfile();
        
        if (!profile) {
          const placeholderProfile = buildPlaceholderProfile(session.user.id);
          setUser(placeholderProfile);
          
          try {
            await upsertCurrentUserProfile(placeholderProfile);
          } catch (placeholderError) {
            console.error('UserContext: Failed to persist placeholder profile during refresh:', placeholderError);
          }
        } else {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    console.log('UserContext: Updating user with:', updates);
    console.log('UserContext: Current user state:', user);
    
    // Always get the current authenticated user to ensure we have the right ID
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      console.error('No authenticated user found:', authError);
      return;
    }
    
    console.log('UserContext: Authenticated user ID:', authUser.id);
    
    // Handle case where no profile exists yet
    if (!user) {
      const newProfile: UserProfile = {
        id: authUser.id, // Use the real authenticated user ID
        name: '',
        age: 0,
        location: '',
        photos: [],
        prompts: [],
        basics: {
          height: '',
          education: '',
          jobTitle: '',
          religion: '',
          lookingFor: '',
        },
        isOnboardingComplete: false,
        ...updates,
      };
      
      console.log('UserContext: Creating new profile:', newProfile);
      setUser(newProfile);
      
      // Save to Supabase
      try {
        const success = await upsertCurrentUserProfile(newProfile);
        console.log('UserContext: Profile save result:', success);
      } catch (error) {
        console.error('Failed to save new profile to Supabase:', error);
      }
      
      return;
    }
    
    // Update existing profile (ensure ID is correct)
    const updatedUser = { 
      ...user, 
      ...updates,
      id: authUser.id // Always use the correct authenticated user ID
    };
    
    console.log('UserContext: Updating existing profile:', updatedUser);
    setUser(updatedUser);
    
    // Save to Supabase
    try {
      const success = await upsertCurrentUserProfile(updatedUser);
      console.log('UserContext: Profile update result:', success);
    } catch (error) {
      console.error('Failed to save profile to Supabase:', error);
    }
  };

  // Load user profile on mount and auth state changes
  useEffect(() => {
    const loadUserProfile = async () => {
      console.log('UserContext: loadUserProfile - starting...');
      
      try {
        const session = getLocalSession();
      
        if (session?.user) {
          console.log('UserContext: loadUserProfile - session found, retrieving Supabase auth user...');
          setLoading(true);
          try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) {
              console.error('UserContext: No authenticated user returned, clearing session');
              clearLocalSession();
              setUser(null);
              return;
            }

            console.log('UserContext: Auth user found, fetching profile...');
            const profile = await getCurrentUserProfile();
            console.log('UserContext: Profile fetched:', profile);
            
            if (!profile) {
              console.log('UserContext: No profile found - initializing placeholder for onboarding');
              
              const placeholderProfile = buildPlaceholderProfile(authUser.id);
              setUser(placeholderProfile);

              try {
                await upsertCurrentUserProfile(placeholderProfile);
                console.log('UserContext: Placeholder profile persisted');
              } catch (placeholderError) {
                console.error('UserContext: Failed to persist placeholder profile:', placeholderError);
              }
            } else {
              setUser(profile);
            }
          } catch (error) {
            console.error('UserContext: Error fetching profile:', error);
            setUser(null);
          } finally {
            setLoading(false);
          }
        } else {
          console.log('UserContext: loadUserProfile - no session, setting user to null');
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('UserContext: Error in loadUserProfile:', error);
        setUser(null);
        setLoading(false);
      }
    };

    loadUserProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        clearLocalSession();
        setUser(null);
        setLoading(false);
      }
      // Don't refresh profile on SIGNED_IN - loadUserProfile handles initial load
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, loading, refreshProfile }}>
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