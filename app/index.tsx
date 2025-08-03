import { useEffect } from 'react';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { user } = useUser();

  console.log('Index screen - Current user:', user);
  console.log('Index screen - Onboarding complete:', user?.isOnboardingComplete);

  useEffect(() => {
    // Only redirect on initial app load, not when navigating between tabs
    const timer = setTimeout(() => {
      if (user?.isOnboardingComplete) {
        console.log('Index: Redirecting to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('Index: Redirecting to onboarding');
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user?.isOnboardingComplete]); // Only depend on onboarding completion status

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