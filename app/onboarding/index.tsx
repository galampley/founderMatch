import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Heart } from 'lucide-react-native';
import { router } from 'expo-router';

export default function OnboardingWelcome() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Heart size={80} color="#0077b5" fill="#0077b5" />
        </View>
        
        <Text style={styles.title}>Welcome to FounderMatch</Text>
        <Text style={styles.subtitle}>
          Let's create your profile so you can start finding your perfect co-founder
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/onboarding/basic-info')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
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
    marginBottom: 60,
  },
  button: {
    backgroundColor: '#0077b5',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 40,
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