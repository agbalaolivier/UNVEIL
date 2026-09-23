import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../context/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (isLoading) return;
    const onAuthScreen = pathname === '/auth';
    const onSharedResult = pathname === '/result';
    if (!user && !onAuthScreen && !onSharedResult) router.replace('/auth');
    if (user && onAuthScreen) router.replace('/(tabs)');
  }, [isLoading, pathname, router, user]);

  return null;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Dialogue' }} />
      </Stack>
      <StatusBar style="auto" />
      <AuthGate />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
