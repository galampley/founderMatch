import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; next?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Auth callback useEffect triggered with params:', params);
    
    const handle = async () => {
      try {
        console.log('Auth callback - starting handle function');
        const code = typeof params.code === 'string' ? params.code : undefined;
        const rawNext = typeof params.next === 'string' ? params.next : '/onboarding';
        const decodedNext = decodeURIComponent(rawNext);
        const next = decodedNext.startsWith('/') ? decodedNext : `/${decodedNext}`;
        
        console.log('Auth callback - extracted code:', code);
        console.log('Auth callback - next path:', next);

        if (!code) {
          console.error('Auth callback - missing code');
          setError('Missing authorization code.');
          return;
        }

        console.log('Auth callback - starting exchangeCodeForSession...');
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        console.log('Auth callback - exchange completed');
        console.log('Auth callback - exchange result:', data, exchangeError);
        
        if (exchangeError) {
          console.error('Auth callback - exchange error:', exchangeError);
          setError(exchangeError.message);
          return;
        }

        if (data.session) {
          console.log('Auth callback - session created successfully:', data.session.user.id);
          console.log('Auth callback - full session data:', data.session);
          
          // Manually save to localStorage as backup
          const sessionKey = `sb-wlnuqrkdemsymbinhnyc-auth-token`;
          localStorage.setItem(sessionKey, JSON.stringify(data.session));
          console.log('Auth callback - manually saved session to localStorage');
          
          // Wait a moment for the session to be persisted
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verify session is accessible
          const { data: { session: verifySession } } = await supabase.auth.getSession();
          console.log('Auth callback - session verified:', !!verifySession);
          console.log('Auth callback - localStorage check:', !!localStorage.getItem(sessionKey));
          
          console.log('Auth callback - redirecting to:', next);
          router.replace(next as never);
        } else {
          console.error('Auth callback - no session in response');
          setError('Authentication failed: no session created');
        }
      } catch (e: any) {
        setError(e?.message ?? 'Unexpected error.');
      }
    };
    handle();
  }, [params, router]);

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


