// Em app/_layout.jsx
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SplashScreen, Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ToastProvider, useToast } from '../components/Toast';
import { Button } from '../components/ui';
import { getUserProfile } from '../api/api';
import { getErrorMessage, isNetworkError, logError } from '../utils/errors';
import { colors, spacing } from '../constants/theme';

// Mantém a splash screen até sabermos se há sessão
SplashScreen.preventAutoHideAsync().catch(() => {});

// Ecrãs acessíveis sem sessão iniciada
const PUBLIC_ROUTES = ['login', 'signup'];

const headerStyle = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

function RootLayout() {
  const { userToken, setUserToken, setUser, isLoading, setIsLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  // 1) Ao arrancar: recupera o token guardado e valida-o no backend
  useEffect(() => {
    async function loadSession() {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const response = await getUserProfile();
          setUser(response.data.user);
          setUserToken(token);
        }
      } catch (e) {
        logError('loadSession', e);
        if (isNetworkError(e)) {
          toast.error(getErrorMessage(e));
        } else if (e.response?.status === 401) {
          await SecureStore.deleteItemAsync('userToken');
          await SecureStore.deleteItemAsync('refreshToken');
        }
        setUser(null);
        setUserToken(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  // 2) Redireciona conforme a sessão (só depois de o navegador estar montado)
  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const isPublic = PUBLIC_ROUTES.includes(segments[0]);

    if (!userToken && !isPublic) {
      router.replace('/login');
    } else if (userToken && isPublic) {
      router.replace('/(tabs)');
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [isLoading, userToken, segments, navigationState?.key]);

  return (
    <Stack screenOptions={headerStyle}>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='signup' options={{ title: 'Criar conta' }} />
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='perfil' options={{ title: 'O meu perfil' }} />
      <Stack.Screen name='admin' options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <RootLayout />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

// Mostrado pelo expo-router quando um ecrã rebenta ao renderizar
export function ErrorBoundary({ error, retry }) {
  return (
    <View style={styles.boundary}>
      <Ionicons name='bug-outline' size={48} color={colors.danger} />
      <Text style={styles.boundaryTitle}>A aplicação encontrou um erro</Text>
      <Text style={styles.boundaryText}>Tente novamente. Se o problema continuar, reinicie a aplicação.</Text>
      {__DEV__ && (
        <ScrollView style={styles.boundaryDetails}>
          <Text style={styles.boundaryCode}>{String(error?.message || error)}</Text>
        </ScrollView>
      )}
      <Button title='Tentar novamente' icon='refresh' onPress={retry} style={{ marginTop: spacing.lg }} />
    </View>
  );
}

const styles = StyleSheet.create({
  boundary: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, backgroundColor: colors.background },
  boundaryTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.lg, textAlign: 'center' },
  boundaryText: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  boundaryDetails: { maxHeight: 160, alignSelf: 'stretch', marginTop: spacing.lg, backgroundColor: colors.dangerBg, borderRadius: 8, padding: spacing.md },
  boundaryCode: { fontFamily: 'monospace', fontSize: 12, color: colors.danger },
});
