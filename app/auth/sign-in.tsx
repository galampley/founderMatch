import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabaseClient';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendMagicLink = async () => {
    if (!email.trim()) {
      Alert.alert('Missing email', 'Please enter your email address.');
      return;
    }
    try {
      setLoading(true);
      const origin = globalThis.location?.origin ?? '';
      // After successful exchange, land inside the app (onboarding entry)
      const next = '/onboarding';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      Alert.alert('Sign-in failed', e?.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <Text style={styles.title}>Sign in</Text>
      {sent ? (
        <Text style={styles.info}>
          We sent a magic link to {email}. Open it on this device to finish sign-in.
        </Text>
      ) : (
        <>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSendMagicLink} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send magic link'}</Text>
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.linkButton}>
        <Text style={styles.linkText}>Back to home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0077b5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  linkButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#0077b5',
    fontSize: 14,
    fontWeight: '600',
  },
});


