import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0B1120' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="events/[id]"
          options={{
            headerShown: true,
            title: 'Event Details',
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: true,
            title: 'Student Registration',
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="management/index"
          options={{
            headerShown: true,
            title: 'Campus Management Hub',
            headerStyle: { backgroundColor: '#0F172A' },
            headerTintColor: '#F8FAFC',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
