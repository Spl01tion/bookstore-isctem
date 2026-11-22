// Em app/perfil.jsx
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Avatar, Badge, InlineError } from '../components/ui';
import { getErrorMessage, logError } from '../utils/errors';
import { BASE_URL } from '../api/config';
import { colors, radius, shadow, spacing } from '../constants/theme';

function Stat({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, label, onPress, color = colors.text, subtitle }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.background }]} accessibilityRole='button'>
      <View style={[styles.rowIcon, { backgroundColor: color === colors.danger ? colors.dangerBg : colors.primaryLight }]}>
        <Ionicons name={icon} size={20} color={color === colors.danger ? colors.danger : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color }]}>{label}</Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      {color !== colors.danger && <Ionicons name='chevron-forward' size={20} color={colors.placeholder} />}
    </Pressable>
  );
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, isAdmin, signOut, refreshUser } = useAuth();
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      await refreshUser();
      setError(null);
    } catch (e) {
      logError('refreshUser', e);
      setError(getErrorMessage(e, 'Não foi possível atualizar o perfil.'));
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Terminar sessão', 'Tem a certeza que quer sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const membroDesde = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
    : '—';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <InlineError message={error} onRetry={reload} />

      <View style={styles.header}>
        <Avatar name={user?.name} size={88} />
        <Text style={styles.name}>{user?.name ?? 'Utilizador'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={{ marginTop: spacing.sm }}>
          {isAdmin ? (
            <Badge label='Administrador' icon='shield-checkmark' />
          ) : (
            <Badge label='Leitor' icon='book-outline' color={colors.textMuted} bg={colors.border} />
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <Stat icon='heart-outline' value={user?.favoritos?.length ?? 0} label='Favoritos' />
        <View style={styles.divider} />
        <Stat icon='download-outline' value={user?.downloads?.length ?? 0} label='Downloads' />
        <View style={styles.divider} />
        <Stat icon='calendar-outline' value={membroDesde} label='Membro desde' />
      </View>

      <Text style={styles.section}>A minha conta</Text>
      <View style={styles.group}>
        <Row icon='heart-outline' label='Os meus favoritos' onPress={() => router.push('/favoritos')} />
        <Row icon='library-outline' label='Explorar catálogo' onPress={() => router.navigate('/(tabs)')} />
      </View>

      {isAdmin && (
        <>
          <Text style={styles.section}>Administração</Text>
          <View style={styles.group}>
            <Row icon='speedometer-outline' label='Painel de administração' subtitle='Livros, categorias e passwords' onPress={() => router.push('/admin')} />
          </View>
        </>
      )}

      <View style={[styles.group, { marginTop: spacing.xl }]}>
        <Row icon='log-out-outline' label='Terminar sessão' color={colors.danger} onPress={handleLogout} />
      </View>

      {__DEV__ && <Text style={styles.debug}>API: {BASE_URL}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  email: { fontSize: 15, color: colors.textMuted, marginTop: 2 },
  stats: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.lg, paddingVertical: spacing.lg, ...shadow },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: spacing.xs },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  statLabel: { fontSize: 12, color: colors.textMuted },
  divider: { width: 1, backgroundColor: colors.border },
  section: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xs },
  group: { backgroundColor: colors.card, borderRadius: radius.lg, overflow: 'hidden', ...shadow },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  debug: { textAlign: 'center', color: colors.placeholder, fontSize: 12, marginTop: spacing.xl },
});
