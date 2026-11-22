// Em app/(tabs)/favoritos.jsx
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteBooks, removeFavoriteBook } from '../../api/api';
import { useToast } from '../../components/Toast';
import { BookCover, EmptyState, ErrorState } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, shadow, spacing } from '../../constants/theme';

function FavoriteItem({ book, onRemove, removing }) {
  return (
    <View style={styles.item}>
      <BookCover uri={book.imagem_uri} style={styles.cover} iconSize={24} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.titulo}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.autores}
        </Text>
      </View>
      <Pressable
        onPress={() => onRemove(book)}
        disabled={removing}
        hitSlop={10}
        style={styles.remove}
        accessibilityLabel={`Remover ${book.titulo} dos favoritos`}
      >
        {removing ? <ActivityIndicator color={colors.heart} /> : <Ionicons name='heart-dislike-outline' size={22} color={colors.heart} />}
      </Pressable>
    </View>
  );
}

export default function FavoritosScreen() {
  const router = useRouter();
  const toast = useToast();
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const hasData = useRef(false);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data } = await getFavoriteBooks();
      setBooks(data);
      setError(null);
      setStatus('ready');
      hasData.current = true;
    } catch (err) {
      logError('getFavoriteBooks', err);
      const message = getErrorMessage(err, 'Não foi possível carregar os favoritos.');
      if (hasData.current) {
        toast.error(message); // mantém a lista que já estava no ecrã
      } else {
        setError(message);
        setStatus('error');
      }
    }
  }, [toast]);

  // Recarrega sempre que o ecrã ganha foco (ex.: depois de favoritar no catálogo)
  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const handleRemove = (book) => {
    Alert.alert('Remover favorito', `Remover "${book.titulo}" dos favoritos?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setRemovingId(book._id);
          try {
            await removeFavoriteBook(book._id);
            setBooks((prev) => prev.filter((b) => b._id !== book._id));
            toast.info(`"${book.titulo}" removido dos favoritos.`);
          } catch (err) {
            logError('removeFavoriteBook', err);
            toast.error(getErrorMessage(err, 'Não foi possível remover o favorito.'));
          } finally {
            setRemovingId(null);
          }
        },
      },
    ]);
  };

  if (status === 'loading') {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <ErrorState
          title='Não foi possível carregar os favoritos'
          message={error}
          onRetry={() => {
            setStatus('loading');
            fetchFavorites();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.list, books.length === 0 && { flex: 1 }]}
        ListHeaderComponent={
          books.length > 0 ? (
            <Text style={styles.count}>
              {books.length} {books.length === 1 ? 'livro guardado' : 'livros guardados'}
            </Text>
          ) : null
        }
        renderItem={({ item }) => <FavoriteItem book={item} onRemove={handleRemove} removing={removingId === item._id} />}
        ListEmptyComponent={
          <EmptyState
            icon='heart-outline'
            title='Ainda não tem favoritos'
            message='Toque no coração de um livro no catálogo para o guardar aqui.'
            actionLabel='Explorar catálogo'
            onAction={() => router.navigate('/(tabs)')}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg, gap: spacing.md },
  count: { fontSize: 14, color: colors.textMuted, fontWeight: '600', marginBottom: spacing.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  cover: { width: 56, aspectRatio: 2 / 3, borderRadius: radius.sm },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  author: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  remove: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
