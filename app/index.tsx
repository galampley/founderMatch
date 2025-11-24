import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { user, loading } = useUser();


  useEffect(() => {
    if (loading) return; // Wait for profile to load
    
    console.log('Index: user =', user);
    console.log('Index: user.isOnboardingComplete =', user?.isOnboardingComplete);
    
    // Only redirect on initial app load, not when navigating between tabs
    const timer = setTimeout(() => {
      if (!user) {
        console.log('Index: No user, redirecting to sign-in');
        router.replace('/auth/sign-in');
      } else if (!user.isOnboardingComplete) {
        console.log('Index: User not onboarded, redirecting to onboarding');
        router.replace('/onboarding');
      } else {
        console.log('Index: User onboarded, redirecting to tabs');
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