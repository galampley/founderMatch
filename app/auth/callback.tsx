import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; next?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [didExchange, setDidExchange] = useState(false);

  useEffect(() => {
    if (didExchange) return;

    const handle = async () => {
      try {
        console.log('Auth callback starting with params:', params);
        
        const code = typeof params.code === 'string' ? params.code : undefined;
        const next = typeof params.next === 'string' ? params.next : '/onboarding';

        console.log('Extracted code:', code ? 'present' : 'missing');
        console.log('Next route:', next);

        if (!code) {
          console.error('No authorization code found');
          setError('Missing authorization code.');
          return;
        }

        console.log('Exchanging code for session...');
        setDidExchange(true);
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error('Session exchange failed:', exchangeError);
          setError(exchangeError.message);
          return;
        }

        console.log('Session exchange successful, navigating to:', next);
        // Type cast because `next` is computed dynamically and expo-router
        // has a very strict union for known routes.
        router.replace(String(next) as any);
      } catch (e: any) {
        console.error('Auth callback error:', e);
        setError(e?.message ?? 'Unexpected error.');
      }
    };
    handle();
  }, [params, didExchange]);

  // Fallback: if a session already exists (e.g., exchange completed but UI missed it), navigate on sight
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const session = data.session;
      if (session) {
        const next = typeof (params as any).next === 'string' ? (params as any).next : '/onboarding';
        console.log('Session detected without visible exchange, navigating to:', next);
        router.replace(String(next) as any);
      }
    })();
    return () => { mounted = false; };
  }, [params]);

  // Also listen for auth state changes and navigate when signed in
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const next = typeof (params as any).next === 'string' ? (params as any).next : '/onboarding';
        console.log('Auth state change -> signed in, navigating to:', next);
        router.replace(String(next) as any);
      }
    });
    return () => { sub.subscription?.unsubscribe(); };
  }, [params]);

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


