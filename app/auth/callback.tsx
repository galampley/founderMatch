import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string | string[]; next?: string | string[] }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handle = async () => {
      try {
        console.log('Auth callback starting with params:', params);
        
        const getParam = (v: string | string[] | undefined): string | undefined => {
          if (!v) return undefined;
          if (Array.isArray(v)) return v[0];
          return v;
        };
        const code = getParam(params.code);
        const next = getParam(params.next) || '/onboarding';

        console.log('Extracted code:', code ? 'present' : 'missing');
        console.log('Next route:', next);

        if (!code) {
          console.error('No authorization code found');
          setError('Missing authorization code.');
          return;
        }

        console.log('Exchanging code for session...');
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


