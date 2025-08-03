import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Heart, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

export default function OnboardingComplete() {
  const { user, updateUser } = useUser();

  const handleComplete = () => {
    // Mark onboarding as complete
    console.log('Current user before completion:', user);
    
    updateUser({
      isOnboardingComplete: true,
    });
    
    console.log('User after marking complete:', user);
    
    // Navigate immediately to tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={80} color="#0077b5" fill="#0077b5" />
        </View>
        
        <Text style={styles.title}>Profile Complete!</Text>
        <Text style={styles.subtitle}>
          Great job, {user?.name}! Your profile is ready and you can start discovering amazing co-founders.
        </Text>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{user?.photos?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Photos</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{user?.prompts?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Prompts</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>100%</Text>
            <Text style={styles.summaryLabel}>Complete</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>Start Discovering</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          You can always edit your profile later in the Profile tab
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    gap: 30,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0077b5',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  button: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});