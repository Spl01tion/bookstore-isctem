// Em components/BookDetailModal.js — detalhes de um livro em folha deslizante
import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BookCover, Button, Chip } from './ui';
import { useToast } from './Toast';
import { colors, radius, spacing } from '../constants/theme';

function Meta({ icon, label, value }) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.metaValue} numberOfLines={1}>
        {value || '—'}
      </Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

export function BookDetailModal({ book, visible, onClose, isFavorite, onToggleFavorite, favoriteLoading, onEdit }) {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  if (!book) return null;

  const ano = book.publiData ? new Date(book.publiData).getFullYear() : null;

  const handleDownload = async () => {
    try {
      await Linking.openURL(book.download_link);
    } catch {
      toast.error('Não foi possível abrir o link de download.');
    }
  };

  return (
    <Modal animationType='slide' transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel='Fechar detalhes' />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.handle} />
        <Pressable onPress={onClose} style={styles.close} hitSlop={10} accessibilityLabel='Fechar'>
          <Ionicons name='close' size={24} color={colors.textMuted} />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
          <View style={styles.top}>
            <BookCover uri={book.imagem_uri} style={styles.cover} iconSize={48} />
            <View style={styles.topInfo}>
              <Text style={styles.title}>{book.titulo}</Text>
              <Text style={styles.author}>{book.autores}</Text>
              <View style={styles.chips}>
                {(book.categoria || []).map((c) => (
                  <Chip key={c._id ?? c} label={c.nome ?? 'Categoria'} small />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Meta icon='document-text-outline' label='Páginas' value={book.pag} />
            <Meta icon='calendar-outline' label='Ano' value={ano} />
            <Meta icon='business-outline' label='Editora' value={book.editora} />
            <Meta icon='language-outline' label='Língua' value={book.lingua} />
          </View>

          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.description}>{book.descricao || 'Sem descrição.'}</Text>
        </ScrollView>

        <View style={styles.actions}>
          <Button
            title={isFavorite ? 'Nos favoritos' : 'Favoritar'}
            icon={isFavorite ? 'heart' : 'heart-outline'}
            variant={isFavorite ? 'secondary' : 'outline'}
            onPress={() => onToggleFavorite(book)}
            loading={favoriteLoading}
            style={{ flex: 1 }}
          />
          <Button
            title={book.download_link ? 'Descarregar' : 'Sem download'}
            icon='download-outline'
            onPress={handleDownload}
            disabled={!book.download_link}
            style={{ flex: 1 }}
          />
        </View>
        {onEdit && (
          <Button
            title='Editar livro (admin)'
            icon='create-outline'
            variant='ghost'
            onPress={() => onEdit(book)}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg * 1.5,
    borderTopRightRadius: radius.lg * 1.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: spacing.md },
  close: { position: 'absolute', top: spacing.md, right: spacing.lg, zIndex: 1 },
  top: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  cover: { width: 110, aspectRatio: 2 / 3, borderRadius: radius.md },
  topInfo: { flex: 1, paddingRight: spacing.xl },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, lineHeight: 26 },
  author: { fontSize: 15, color: colors.textMuted, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.md },
  metaRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metaItem: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 2 },
  metaValue: { fontSize: 14, fontWeight: '700', color: colors.text },
  metaLabel: { fontSize: 11, color: colors.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: spacing.xl, marginBottom: spacing.sm },
  description: { fontSize: 15, lineHeight: 23, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderColor: colors.border },
});
