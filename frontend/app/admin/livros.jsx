// Em app/admin/livros.jsx — lista de livros para editar
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAllLivros } from '../../api/api';
import { useToast } from '../../components/Toast';
import { BookCover, EmptyState, ErrorState } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, shadow, spacing } from '../../constants/theme';

const normalize = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function AdminLivros() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [livros, setLivros] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const hasData = useRef(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getAllLivros();
      setLivros(data);
      setStatus('ready');
      hasData.current = true;
    } catch (e) {
      logError('adminLivros', e);
      const message = getErrorMessage(e, 'Não foi possível carregar os livros.');
      if (hasData.current) toast.error(message);
      else {
        setError(message);
        setStatus('error');
      }
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return q ? livros.filter((l) => normalize(l.titulo).includes(q) || normalize(l.autores).includes(q)) : livros;
  }, [livros, search]);

  const edit = (livro) => router.push({ pathname: '/admin/editLivro', params: { livro: JSON.stringify(livro) } });

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }
  if (status === 'error') {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          setStatus('loading');
          load();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filtered}
        keyExtractor={(l) => l._id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={styles.search}>
            <Ionicons name='search' size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={`Pesquisar em ${livros.length} livros`}
              placeholderTextColor={colors.placeholder}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [styles.item, pressed && { opacity: 0.85 }]} onPress={() => edit(item)}>
            <BookCover uri={item.imagem_uri} style={styles.cover} iconSize={22} />
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={2}>
                {item.titulo}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {item.autores}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {(item.categoria || []).map((c) => c.nome).join(' · ') || 'Sem categoria'}
                {!item.download_link ? '  ·  sem download' : ''}
              </Text>
            </View>
            <Ionicons name='create-outline' size={22} color={colors.primary} />
          </Pressable>
        )}
        ListEmptyComponent={<EmptyState icon='search-outline' title='Nenhum livro encontrado' />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + spacing.xl }]}
        onPress={() => router.push('/admin/createLivro')}
        accessibilityLabel='Adicionar livro'
      >
        <Ionicons name='add' size={30} color='#fff' />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: spacing.md, ...shadow },
  searchInput: { flex: 1, height: 48, fontSize: 16, color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, ...shadow },
  cover: { width: 50, aspectRatio: 2 / 3, borderRadius: radius.sm },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  author: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  meta: { fontSize: 12, color: colors.primary, marginTop: 4 },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
    elevation: 6,
  },
});
