import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="basic-info" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="prompts" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}