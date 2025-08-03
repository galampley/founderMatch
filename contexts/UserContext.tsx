import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserProfile } from '@/types/user';

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Initialize with a basic user object
    return {
      id: '1',
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
    };
  });

  const updateUser = (updates: Partial<UserProfile>) => {
    console.log('UserContext: Updating user with:', updates);
    console.log('UserContext: Current user before update:', user);
    
    setUser(prev => {
      if (!prev) {
        // If no previous user, create new one with updates
        return {
          id: '1',
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
      }
      return { ...prev, ...updates };
    });
    
    setTimeout(() => {
      setUser(current => {
        console.log('UserContext: User after update:', current);
        return current;
      });
    }, 100);
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