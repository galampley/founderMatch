import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { user, loading } = useUser();


  useEffect(() => {
    if (loading) return; // Wait for profile to load
    
    // Only redirect on initial app load, not when navigating between tabs
    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/auth/sign-in');
      } else {
        router.replace('/(tabs)');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading]);

  // Show loading spinner while determining route
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
});