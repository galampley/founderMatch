const SESSION_KEY = 'sb-wlnuqrkdemsymbinhnyc-auth-token';

export interface SessionData {
  user: {
    id: string;
    email?: string;
  };
  access_token: string;
  expires_at?: number;
}

export function getLocalSession(): SessionData | null {
  try {
    const localSession = localStorage.getItem(SESSION_KEY);
    if (!localSession) return null;
    
    const parsedSession = JSON.parse(localSession);
    
    // Validate session is not expired
    const expiresAt = parsedSession?.expires_at;
    if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
      console.log('Session expired, clearing localStorage');
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return parsedSession;
  } catch (error) {
    console.error('Error parsing localStorage session:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearLocalSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function saveLocalSession(session: SessionData): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}