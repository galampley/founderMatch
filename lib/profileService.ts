import { supabase } from './supabaseClient';
import { UserProfile, OnboardingData } from '../types/user';

// Database row type (what comes from Supabase)
interface ProfileRow {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  prompts: Array<{ question: string; answer: string; }>;
  basics: {
    height: string;
    education: string;
    jobTitle: string;
    religion: string;
    lookingFor: string;
  };
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

// Convert database row to UserProfile
function rowToUserProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    location: row.location,
    photos: row.photos || [],
    prompts: row.prompts || [],
    basics: row.basics || {
      height: '',
      education: '',
      jobTitle: '',
      religion: '',
      lookingFor: ''
    },
    isOnboardingComplete: row.is_onboarding_complete
  };
}

// Convert UserProfile to database format
function userProfileToRow(profile: UserProfile): Partial<ProfileRow> {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    location: profile.location,
    photos: profile.photos,
    prompts: profile.prompts,
    basics: profile.basics,
    is_onboarding_complete: profile.isOnboardingComplete
  };
}

// Convert OnboardingData to database format
function onboardingDataToRow(userId: string, data: OnboardingData): Partial<ProfileRow> {
  return {
    id: userId,
    name: data.name,
    age: parseInt(data.age),
    location: data.location,
    photos: data.photos,
    prompts: data.prompts,
    basics: {
      height: data.height,
      education: data.education,
      jobTitle: data.jobTitle,
      religion: data.religion,
      lookingFor: data.lookingFor
    },
    is_onboarding_complete: true
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    // Get user ID from localStorage session instead of calling getUser()
    const localSession = localStorage.getItem('sb-wlnuqrkdemsymbinhnyc-auth-token');
    if (!localSession) {
      console.log('No session found in localStorage');
      return null;
    }
    
    const parsedSession = JSON.parse(localSession);
    const userId = parsedSession?.user?.id;
    
    if (!userId) {
      console.log('No user ID found in session');
      return null;
    }
    
    console.log('ProfileService: Using user ID from localStorage:', userId);
    console.log('ProfileService: About to query database...');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    console.log('ProfileService: Database query completed');
    console.log('ProfileService: Query result - data:', !!data, 'error:', error);

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found, return null
        console.log('No profile found for user');
        return null;
      }
      console.error('Error fetching user profile:', error);
      return null;
    }

    return rowToUserProfile(data as ProfileRow);
  } catch (error) {
    console.error('Unexpected error in getCurrentUserProfile:', error);
    return null;
  }
}

export async function upsertCurrentUserProfile(profile: UserProfile): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting current user:', authError);
      return false;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    const profileRow = userProfileToRow(profile);
    profileRow.id = user.id; // Ensure the ID matches the authenticated user

    const { error } = await supabase
      .from('profiles')
      .upsert(profileRow, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in upsertCurrentUserProfile:', error);
    return false;
  }
}

export async function createProfileFromOnboarding(data: OnboardingData): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting current user:', authError);
      return false;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    const profileRow = onboardingDataToRow(user.id, data);

    const { error } = await supabase
      .from('profiles')
      .upsert(profileRow, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error creating profile from onboarding:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in createProfileFromOnboarding:', error);
    return false;
  }
}

export async function updateProfileField<K extends keyof UserProfile>(
  field: K, 
  value: UserProfile[K]
): Promise<boolean> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting current user:', authError);
      return false;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }

    // Convert field name to database column name
    const dbField = field === 'isOnboardingComplete' ? 'is_onboarding_complete' : field;

    const { error } = await supabase
      .from('profiles')
      .update({ [dbField]: value })
      .eq('id', user.id);

    if (error) {
      console.error(`Error updating profile field ${field}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Unexpected error updating profile field ${field}:`, error);
    return false;
  }
}