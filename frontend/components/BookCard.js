// Em components/BookCard.js — cartão de livro para a grelha
import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookCover } from './ui';
import { colors, radius, shadow, spacing } from '../constants/theme';

export const BookCard = memo(function BookCard({ book, width, isFavorite, onPress, onToggleFavorite }) {
  const categoria = book.categoria?.[0]?.nome;
  const ano = book.publiData ? new Date(book.publiData).getFullYear() : null;

  return (
    <Pressable
      onPress={() => onPress(book)}
      style={({ pressed }) => [styles.card, { width }, pressed && { transform: [{ scale: 0.98 }] }]}
      accessibilityRole='button'
      accessibilityLabel={`${book.titulo}, de ${book.autores}`}
    >
      <View>
        <BookCover uri={book.imagem_uri} style={styles.cover} />
        <Pressable
          onPress={() => onToggleFavorite(book)}
          hitSlop={8}
          style={styles.heart}
          accessibilityRole='button'
          accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={20} color={isFavorite ? colors.heart : colors.text} />
        </Pressable>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {book.titulo}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {book.autores}
        </Text>
        <View style={styles.meta}>
          {categoria && (
            <Text style={styles.category} numberOfLines={1}>
              {categoria}
            </Text>
          )}
          {ano && <Text style={styles.year}>{ano}</Text>}
        </View>
      </View>
    </Pressable>
  );
});

// Cartão "fantasma" mostrado enquanto os livros carregam
export function BookCardSkeleton({ width }) {
  return (
    <View style={[styles.card, { width }]}>
      <View style={[styles.cover, { backgroundColor: colors.skeleton }]} />
      <View style={styles.info}>
        <View style={[styles.skeletonLine, { width: '85%' }]} />
        <View style={[styles.skeletonLine, { width: '55%', marginTop: 8 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, overflow: 'hidden', ...shadow },
  cover: { width: '100%', aspectRatio: 2 / 3 },
  heart: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: spacing.md },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, lineHeight: 20, minHeight: 40 },
  author: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, gap: 6 },
  category: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  year: { fontSize: 12, color: colors.textMuted },
  skeletonLine: { height: 12, borderRadius: 6, backgroundColor: colors.skeleton },
});
