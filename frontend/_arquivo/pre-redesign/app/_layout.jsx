// Em app/_layout.jsx
import React, { useEffect } from 'react';
import { SplashScreen, Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/api';

// Mantém a splash screen até sabermos se há sessão
SplashScreen.preventAutoHideAsync().catch(() => {});

// Ecrãs acessíveis sem sessão iniciada
const PUBLIC_ROUTES = ['login', 'signup', 'forgotPassword'];

function RootLayout() {
  const { userToken, setUserToken, setUser, isLoading, setIsLoading } = useAuth();
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
        // Token inválido/expirado ou API inacessível: começa sem sessão
        console.warn('Sessão não restaurada:', e.response?.data?.message || e.message);
        if (e.response?.status === 401) {
          await SecureStore.deleteItemAsync('userToken');
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

    const current = segments[segments.length - 1];
    const isPublic = PUBLIC_ROUTES.includes(current);

    if (!userToken && !isPublic) {
      router.replace('/login');
    } else if (userToken && current === 'login') {
      router.replace('/(tabs)');
    }
    SplashScreen.hideAsync().catch(() => {});
  }, [isLoading, userToken, segments, navigationState?.key]);

  return (
    <Stack>
      <Stack.Screen name='login' options={{ headerShown: false }} />
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name='perfil' options={{ title: 'Perfil' }} />
      <Stack.Screen name='filtros' options={{ title: 'Filtros' }} />
      <Stack.Screen name='editLivro' options={{ title: 'Editar Livro' }} />
    </Stack>
  );
}

export default function RootLayoutNav() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
