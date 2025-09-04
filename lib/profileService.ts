import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types/user';

type DbProfileRow = {
  id: string;
  name: string | null;
  age: number | null;
  location: string | null;
  photos: string[] | null;
  prompts: Array<{ question: string; answer: string }> | null;
  basics: {
    height?: string;
    education?: string;
    jobTitle?: string;
    religion?: string;
    lookingFor?: string;
  } | null;
  is_onboarding_complete: boolean | null;
};

const emptyUser: UserProfile = {
  id: '',
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

function mapRowToUserProfile(row: DbProfileRow, id: string): UserProfile {
  return {
    id,
    name: row.name ?? '',
    age: row.age ?? 0,
    location: row.location ?? '',
    photos: row.photos ?? [],
    prompts: row.prompts ?? [],
    basics: {
      height: row.basics?.height ?? '',
      education: row.basics?.education ?? '',
      jobTitle: row.basics?.jobTitle ?? '',
      religion: row.basics?.religion ?? '',
      lookingFor: row.basics?.lookingFor ?? '',
    },
    isOnboardingComplete: row.is_onboarding_complete ?? false,
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    // eslint-disable-next-line no-console
    console.warn('getCurrentUserProfile error', error);
  }

  if (!data) {
    return { ...emptyUser, id: uid };
  }

  return mapRowToUserProfile(data as unknown as DbProfileRow, uid);
}

export async function upsertCurrentUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;

  // Prepare row to upsert
  const row: Record<string, unknown> = { id: uid };
  if (typeof updates.name !== 'undefined') row.name = updates.name;
  if (typeof updates.age !== 'undefined') row.age = updates.age;
  if (typeof updates.location !== 'undefined') row.location = updates.location;
  if (typeof updates.photos !== 'undefined') row.photos = updates.photos;
  if (typeof updates.prompts !== 'undefined') row.prompts = updates.prompts;
  if (typeof updates.basics !== 'undefined') row.basics = updates.basics;
  if (typeof updates.isOnboardingComplete !== 'undefined') {
    row.is_onboarding_complete = updates.isOnboardingComplete;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn('upsertCurrentUserProfile error', error);
    return null;
  }

  return mapRowToUserProfile(data as unknown as DbProfileRow, uid);
}


