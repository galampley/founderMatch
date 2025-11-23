import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '@/types/user';
import { getCurrentUserProfile, upsertCurrentUserProfile } from '@/lib/profileService';
import { supabase } from '@/lib/supabaseClient';

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    setLoading(true);
    try {
      console.log('UserContext: refreshProfile - checking auth status...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('UserContext: current session:', session, sessionError);
      
      if (session) {
        console.log('UserContext: session found, fetching profile...');
        const profile = await getCurrentUserProfile();
        console.log('UserContext: profile fetched:', profile);
        setUser(profile);
      } else {
        console.log('UserContext: no session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
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
        // Check localStorage first since getSession() might be hanging
        const localSession = localStorage.getItem('sb-wlnuqrkdemsymbinhnyc-auth-token');
        console.log('UserContext: localStorage session exists:', !!localSession);
        
        let session = null;
        
        if (localSession) {
          try {
            console.log('UserContext: Found localStorage session, parsing...');
            const parsedSession = JSON.parse(localSession);
            console.log('UserContext: Parsed session user ID:', parsedSession?.user?.id);
            
            // Skip setSession since it's hanging - use session data directly
            session = parsedSession;
            console.log('UserContext: Using localStorage session directly (bypassing setSession)');
          } catch (parseError) {
            console.error('UserContext: Error parsing localStorage session:', parseError);
          }
        }
        
        if (!session) {
          console.log('UserContext: No localStorage session, trying getSession...');
          const { data: { session: supabaseSession }, error } = await supabase.auth.getSession();
          console.log('UserContext: getSession completed');
          session = supabaseSession;
          console.log('UserContext: getSession result:', !!session, error);
        }
      
        if (session?.user) {
          console.log('UserContext: loadUserProfile - session found, fetching profile directly...');
          setLoading(true);
          try {
            console.log('UserContext: Fetching profile from database...');
            const profile = await getCurrentUserProfile();
            console.log('UserContext: Profile fetched:', profile);
            setUser(profile);
          } catch (error) {
            console.error('UserContext: Error fetching profile:', error);
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
      if (session?.user) {
        await refreshProfile();
      } else {
        setUser(null);
        setLoading(false);
      }
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