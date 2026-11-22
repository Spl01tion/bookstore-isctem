// Em app/admin/_layout.jsx — área reservada a administradores
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { colors } from '../../constants/theme';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Um utilizador normal que chegue aqui (ex.: por link) é enviado de volta ao catálogo
  useEffect(() => {
    if (user && !isAdmin) {
      toast.error('Área reservada a administradores.');
      router.replace('/(tabs)');
    }
  }, [user, isAdmin]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDark },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name='index' options={{ title: 'Administração' }} />
      <Stack.Screen name='livros' options={{ title: 'Gerir livros' }} />
      <Stack.Screen name='createLivro' options={{ title: 'Adicionar livro' }} />
      <Stack.Screen name='editLivro' options={{ title: 'Editar livro' }} />
      <Stack.Screen name='categorias' options={{ title: 'Categorias' }} />
      <Stack.Screen name='redefinirSenha' options={{ title: 'Redefinir password' }} />
    </Stack>
  );
}
