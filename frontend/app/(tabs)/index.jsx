// Em app/(tabs)/index.jsx — catálogo de livros em grelha
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAllCategorias, getAllLivros } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { useFavorites } from '../../hooks/useFavorites';
import { BookCard, BookCardSkeleton } from '../../components/BookCard';
import { BookDetailModal } from '../../components/BookDetailModal';
import { Chip, EmptyState, ErrorState } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, shadow, spacing } from '../../constants/theme';

const GAP = spacing.md;
const PADDING = spacing.lg;
const MIN_CARD_WIDTH = 150;

const normalize = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export default function HomeScreen() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAdmin } = useAuth();
  const { width } = useWindowDimensions();
  const { favoriteIds, loadFavorites, toggleFavorite, pendingId } = useFavorites();

  const [livros, setLivros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  // Grelha responsiva: 2 colunas em telemóveis, mais em ecrãs largos
  const columns = Math.max(2, Math.floor((width - PADDING * 2 + GAP) / (MIN_CARD_WIDTH + GAP)));
  const cardWidth = (width - PADDING * 2 - GAP * (columns - 1)) / columns;

  const loadData = useCallback(
    async ({ silent = false } = {}) => {
      const [livrosRes, categoriasRes, favRes] = await Promise.allSettled([
        getAllLivros(),
        getAllCategorias(),
        loadFavorites(),
      ]);

      if (livrosRes.status === 'fulfilled') {
        setLivros(livrosRes.value.data);
        setLoadError(null);
        setStatus('ready');
      } else {
        logError('getAllLivros', livrosRes.reason);
        const message = getErrorMessage(livrosRes.reason, 'Não foi possível carregar os livros.');
        // Se já havia livros no ecrã, mantém-nos e só avisa
        setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
        setLoadError(message);
        if (silent) toast.error(message);
      }

      if (categoriasRes.status === 'fulfilled') setCategorias(categoriasRes.value.data);
      else toast.error('Não foi possível carregar as categorias para os filtros.');

      if (favRes.status === 'rejected' && livrosRes.status === 'fulfilled') {
        toast.error(getErrorMessage(favRes.reason, 'Não foi possível carregar os seus favoritos.'));
      }
    },
    [loadFavorites, toast]
  );

  useEffect(() => {
    loadData();
  }, []);

  // Ao voltar a este ecrã (ex.: depois de mexer nos favoritos ou editar um livro) atualiza em silêncio
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) loadData({ silent: true });
      focusedOnce.current = true;
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData({ silent: true });
    setRefreshing(false);
  }, [loadData]);

  const retry = async () => {
    setStatus('loading');
    await loadData();
  };

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return livros.filter((l) => {
      const matchesSearch = !q || normalize(l.titulo).includes(q) || normalize(l.autores).includes(q);
      const matchesCategoria = !categoriaId || (l.categoria || []).some((c) => (c._id ?? c) === categoriaId);
      return matchesSearch && matchesCategoria;
    });
  }, [livros, search, categoriaId]);

  // Só mostra categorias que têm livros
  const categoriasComLivros = useMemo(() => {
    const counts = {};
    livros.forEach((l) => (l.categoria || []).forEach((c) => (counts[c._id ?? c] = (counts[c._id ?? c] || 0) + 1)));
    return categorias.filter((c) => counts[c._id]).map((c) => ({ ...c, count: counts[c._id] }));
  }, [livros, categorias]);

  const hasFilters = !!search.trim() || !!categoriaId;
  const clearFilters = () => {
    setSearch('');
    setCategoriaId(null);
  };

  const openEdit = (book) => {
    setSelectedBook(null);
    router.push({ pathname: '/admin/editLivro', params: { livro: JSON.stringify(book) } });
  };

  const header = (
    <View>
      <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'leitor'} 👋</Text>
      <Text style={styles.subGreeting}>O que vai ler hoje?</Text>

      <View style={styles.search}>
        <Ionicons name='search' size={20} color={colors.textMuted} />
        <TextInput
          placeholder='Pesquisar por título ou autor'
          placeholderTextColor={colors.placeholder}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          returnKeyType='search'
          accessibilityLabel='Pesquisar livros'
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={10} accessibilityLabel='Limpar pesquisa'>
            <Ionicons name='close-circle' size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips} contentContainerStyle={{ paddingHorizontal: PADDING }}>
        <Chip label={`Todos (${livros.length})`} active={!categoriaId} onPress={() => setCategoriaId(null)} />
        {categoriasComLivros.map((c) => (
          <Chip
            key={c._id}
            label={`${c.nome} (${c.count})`}
            active={categoriaId === c._id}
            onPress={() => setCategoriaId(categoriaId === c._id ? null : c._id)}
          />
        ))}
      </ScrollView>

      <View style={styles.resultsRow}>
        <Text style={styles.resultsText}>
          {filtered.length} {filtered.length === 1 ? 'livro' : 'livros'}
        </Text>
        {hasFilters && (
          <Pressable onPress={clearFilters} hitSlop={8}>
            <Text style={styles.clear}>Limpar filtros</Text>
          </Pressable>
        )}
      </View>

      {loadError && status === 'ready' && (
        <Pressable style={styles.staleBanner} onPress={onRefresh}>
          <Ionicons name='warning-outline' size={16} color={colors.danger} />
          <Text style={styles.staleText}>A mostrar dados antigos. Toque para tentar de novo.</Text>
        </Pressable>
      )}
    </View>
  );

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <ErrorState title='Não foi possível carregar os livros' message={loadError} onRetry={retry} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        key={columns} // FlatList exige remontar quando o nº de colunas muda
        data={status === 'loading' ? Array.from({ length: columns * 3 }, (_, i) => ({ _id: `sk-${i}`, skeleton: true })) : filtered}
        numColumns={columns}
        keyExtractor={(item) => String(item._id)}
        columnWrapperStyle={{ gap: GAP, paddingHorizontal: PADDING }}
        contentContainerStyle={{ gap: GAP, paddingBottom: spacing.xxl }}
        ListHeaderComponent={header}
        renderItem={({ item }) =>
          item.skeleton ? (
            <BookCardSkeleton width={cardWidth} />
          ) : (
            <BookCard
              book={item}
              width={cardWidth}
              isFavorite={favoriteIds.has(item._id)}
              onPress={setSelectedBook}
              onToggleFavorite={toggleFavorite}
            />
          )
        }
        ListEmptyComponent={
          <EmptyState
            icon={hasFilters ? 'search-outline' : 'library-outline'}
            title={hasFilters ? 'Nenhum livro corresponde à pesquisa' : 'Ainda não há livros'}
            message={hasFilters ? 'Experimente outras palavras ou outra categoria.' : isAdmin ? 'Adicione o primeiro livro no painel de administração.' : undefined}
            actionLabel={hasFilters ? 'Limpar filtros' : isAdmin ? 'Adicionar livro' : undefined}
            onAction={hasFilters ? clearFilters : () => router.push('/admin/createLivro')}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
        keyboardShouldPersistTaps='handled'
      />

      <BookDetailModal
        book={selectedBook}
        visible={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        isFavorite={selectedBook ? favoriteIds.has(selectedBook._id) : false}
        favoriteLoading={pendingId === selectedBook?._id}
        onToggleFavorite={toggleFavorite}
        onEdit={isAdmin ? openEdit : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  greeting: { fontSize: 24, fontWeight: '800', color: colors.text, paddingHorizontal: PADDING, marginTop: spacing.lg },
  subGreeting: { fontSize: 15, color: colors.textMuted, paddingHorizontal: PADDING, marginTop: 2 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginHorizontal: PADDING,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    ...shadow,
  },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: colors.text },
  chips: { marginTop: spacing.md, flexGrow: 0 },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  resultsText: { fontSize: 14, color: colors.textMuted, fontWeight: '600' },
  clear: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: PADDING,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerBg,
  },
  staleText: { flex: 1, fontSize: 13, color: colors.danger },
});
