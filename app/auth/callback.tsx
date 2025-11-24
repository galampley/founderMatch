import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';
import { saveLocalSession } from '@/lib/sessionUtils';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; access_token?: string; next?: string }>();
  const hashParams = useMemo(() => {
    if (typeof window === 'undefined') return {};
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    return Object.fromEntries(new URLSearchParams(hash));
  }, []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth callback useEffect triggered with params:', params);
    
    const handle = async () => {
      try {
        console.log('Auth callback - starting handle function');
        const code = typeof params.code === 'string' ? params.code : undefined;
        const access_token =
          typeof params.access_token === 'string'
            ? params.access_token
            : typeof hashParams.access_token === 'string'
              ? hashParams.access_token
              : undefined;
        const rawNext = typeof params.next === 'string' ? params.next : '/onboarding';
        const decodedNext = decodeURIComponent(rawNext);
        const next = decodedNext.startsWith('/') ? decodedNext : `/${decodedNext}`;
        
        console.log('Auth callback - extracted code:', code);
        console.log('Auth callback - extracted access_token:', !!access_token);
        console.log('Auth callback - next path:', next);

        let session = null;

        if (access_token) {
          // Implicit flow - tokens provided directly in URL
          console.log('Auth callback - using implicit flow (access_token found)');
          
          // Let Supabase handle the implicit flow automatically since detectSessionInUrl: true
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait for Supabase to process
          
          const { data: { session: implicitSession }, error: sessionError } = await supabase.auth.getSession();
          console.log('Auth callback - implicit session result:', !!implicitSession, sessionError);
          
          if (implicitSession) {
            session = implicitSession;
            console.log('Auth callback - implicit session found:', implicitSession.user.id);
          } else {
            console.error('Auth callback - implicit flow failed to create session');
            setError('Authentication failed: could not create session from token');
            return;
          }
        } else if (code) {
          // PKCE flow - exchange code for session
          console.log('Auth callback - using PKCE flow (code found)');
          console.log('Auth callback - starting exchangeCodeForSession...');
          
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          console.log('Auth callback - exchange completed');
          console.log('Auth callback - exchange result:', !!data?.session, exchangeError);
          
          if (exchangeError) {
            console.error('Auth callback - exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }

          session = data?.session || null;
        } else {
          console.error('Auth callback - no auth code or token found');
          setError('Missing authorization code or token.');
          return;
        }

        if (session) {
          console.log('Auth callback - session created successfully:', session.user.id);
          
          // Manually save to localStorage as backup
          const sessionKey = `sb-wlnuqrkdemsymbinhnyc-auth-token`;
          localStorage.setItem(sessionKey, JSON.stringify(session));
          console.log('Auth callback - manually saved session to localStorage');
          
          // Wait a moment for the session to be persisted
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log('Auth callback - redirecting to:', next);
          router.replace(next as never);
        } else {
          console.error('Auth callback - no session created');
          setError('Authentication failed: no session created');
        }
      } catch (e: any) {
        console.error('Auth callback - unexpected error:', e);
        setError(e?.message ?? 'Unexpected error.');
      }
    };
    handle();
  }, [params, router, hashParams]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication failed: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0077b5" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  errorText: {
    color: '#ff6b6b',
  },
});


