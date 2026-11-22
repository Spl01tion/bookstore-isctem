// Em app/(tabs)/_layout.jsx — menu lateral da app (a autenticação é tratada em app/_layout.jsx)
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Drawer, DrawerContentScrollView, DrawerItem, DrawerItemList } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Avatar, Badge } from '../../components/ui';
import { colors, spacing } from '../../constants/theme';

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

function confirmSignOut(signOut) {
  Alert.alert('Terminar sessão', 'Tem a certeza que quer sair?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Sair', style: 'destructive', onPress: signOut },
  ]);
}

function DrawerContent(props) {
  const router = useRouter();
  const { user, isAdmin, signOut } = useAuth();

  const go = (path) => {
    props.navigation.closeDrawer();
    router.push(path);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
      <Pressable style={styles.profile} onPress={() => go('/perfil')} accessibilityLabel='Abrir perfil'>
        <Avatar name={user?.name} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name ?? 'Utilizador'}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
          {isAdmin && <Badge label='Administrador' icon='shield-checkmark' />}
        </View>
      </Pressable>

      <DrawerItemList {...props} />
      <DrawerItem label='O meu perfil' icon={icon('person-circle-outline')} onPress={() => go('/perfil')} />

      {isAdmin && (
        <>
          <Text style={styles.section}>ADMINISTRAÇÃO</Text>
          <DrawerItem label='Painel de administração' icon={icon('speedometer-outline')} onPress={() => go('/admin')} />
          <DrawerItem label='Adicionar livro' icon={icon('add-circle-outline')} onPress={() => go('/admin/createLivro')} />
        </>
      )}

      <View style={{ flex: 1 }} />
      <DrawerItem
        label='Terminar sessão'
        icon={({ size }) => <Ionicons name='log-out-outline' size={size} color={colors.danger} />}
        labelStyle={{ color: colors.danger }}
        onPress={() => confirmSignOut(signOut)}
      />
    </DrawerContentScrollView>
  );
}

function HeaderActions() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  return (
    <View style={styles.headerActions}>
      {isAdmin && (
        <Pressable onPress={() => router.push('/admin')} hitSlop={8} accessibilityLabel='Painel de administração'>
          <Ionicons name='shield-checkmark-outline' size={24} color='#fff' />
        </Pressable>
      )}
      <Pressable onPress={() => router.push('/perfil')} hitSlop={8} accessibilityLabel='O meu perfil'>
        <Ionicons name='person-circle-outline' size={28} color='#fff' />
      </Pressable>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        drawerActiveTintColor: colors.primary,
        drawerActiveBackgroundColor: colors.primaryLight,
        headerRight: () => <HeaderActions />,
      }}
    >
      <Drawer.Screen name='index' options={{ title: 'Catálogo', drawerLabel: 'Catálogo', drawerIcon: icon('library-outline') }} />
      <Drawer.Screen name='favoritos' options={{ title: 'Favoritos', drawerLabel: 'Os meus favoritos', drawerIcon: icon('heart-outline') }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginBottom: 4 },
  section: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: spacing.lg, marginBottom: 4, marginLeft: spacing.lg + 4, letterSpacing: 0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginRight: spacing.lg },
});
