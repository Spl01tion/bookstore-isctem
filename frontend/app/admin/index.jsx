// Em app/admin/index.jsx — painel de administração
import React, { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllCategorias, getAllLivros } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { InlineError } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, shadow, spacing } from '../../constants/theme';

function StatCard({ icon, value, label, loading }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.statValue}>{loading ? '…' : value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Action({ icon, title, subtitle, onPress, color = colors.primary }) {
  return (
    <Pressable style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]} onPress={onPress} accessibilityRole='button'>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color='#fff' />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name='chevron-forward' size={20} color={colors.placeholder} />
    </Pressable>
  );
}

export default function AdminHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState({ livros: 0, categorias: 0, semDownload: 0, semCategoria: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [livros, categorias] = await Promise.all([getAllLivros(), getAllCategorias()]);
      setStats({
        livros: livros.data.length,
        categorias: categorias.data.length,
        semDownload: livros.data.filter((l) => !l.download_link).length,
        semCategoria: categorias.data.filter((c) => !livros.data.some((l) => (l.categoria || []).some((lc) => (lc._id ?? lc) === c._id))).length,
      });
      setError(null);
    } catch (e) {
      logError('adminStats', e);
      setError(getErrorMessage(e, 'Não foi possível carregar as estatísticas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
    >
      <Text style={styles.hello}>Olá, {user?.name?.split(' ')[0]}</Text>
      <Text style={styles.sub}>Gerir o catálogo da biblioteca</Text>

      <InlineError message={error} onRetry={load} style={{ marginTop: spacing.lg }} />

      <View style={styles.stats}>
        <StatCard icon='book-outline' value={stats.livros} label='Livros' loading={loading} />
        <StatCard icon='pricetags-outline' value={stats.categorias} label='Categorias' loading={loading} />
      </View>

      {!loading && !error && (stats.semDownload > 0 || stats.semCategoria > 0) && (
        <View style={styles.notice}>
          <Ionicons name='information-circle-outline' size={20} color={colors.info} />
          <View style={{ flex: 1 }}>
            {stats.semDownload > 0 && <Text style={styles.noticeText}>{stats.semDownload} livro(s) sem link de download.</Text>}
            {stats.semCategoria > 0 && <Text style={styles.noticeText}>{stats.semCategoria} categoria(s) sem livros.</Text>}
          </View>
        </View>
      )}

      <Text style={styles.section}>Catálogo</Text>
      <Action icon='add' title='Adicionar livro' subtitle='Registar um novo livro no catálogo' onPress={() => router.push('/admin/createLivro')} />
      <Action icon='create-outline' title='Gerir livros' subtitle='Pesquisar e editar livros existentes' onPress={() => router.push('/admin/livros')} />
      <Action icon='pricetags-outline' title='Categorias' subtitle='Ver e criar categorias' onPress={() => router.push('/admin/categorias')} />

      <Text style={styles.section}>Utilizadores</Text>
      <Action icon='key-outline' title='Redefinir password' subtitle='Definir uma nova password para um utilizador' color={colors.primaryDark} onPress={() => router.push('/admin/redefinirSenha')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hello: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  stats: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, ...shadow },
  statIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  statLabel: { fontSize: 13, color: colors.textMuted },
  notice: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  noticeText: { color: colors.info, fontSize: 13, lineHeight: 19 },
  section: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.xl, marginBottom: spacing.sm, marginLeft: spacing.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadow },
  actionIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  actionSubtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
