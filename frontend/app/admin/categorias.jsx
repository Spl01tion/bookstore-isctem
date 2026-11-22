// Em app/admin/categorias.jsx — listar e criar categorias
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createCategoria, getAllCategorias, getAllLivros } from '../../api/api';
import { useToast } from '../../components/Toast';
import { Button, ErrorState, TextField } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, shadow, spacing } from '../../constants/theme';

export default function AdminCategorias() {
  const toast = useToast();
  const [categorias, setCategorias] = useState([]);
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [nome, setNome] = useState('');
  const [nomeError, setNomeError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [cats, livros] = await Promise.all([getAllCategorias(), getAllLivros()]);
      const c = {};
      livros.data.forEach((l) => (l.categoria || []).forEach((lc) => (c[lc._id ?? lc] = (c[lc._id ?? lc] || 0) + 1)));
      setCategorias(cats.data);
      setCounts(c);
      setStatus('ready');
    } catch (e) {
      logError('adminCategorias', e);
      setError(getErrorMessage(e, 'Não foi possível carregar as categorias.'));
      setStatus('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCreate = async () => {
    const value = nome.trim();
    if (value.length < 2) {
      setNomeError('O nome deve ter pelo menos 2 caracteres.');
      return;
    }
    setSaving(true);
    try {
      const { data } = await createCategoria(value);
      setCategorias((prev) => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      setNome('');
      toast.success(`Categoria "${data.nome}" criada.`);
    } catch (e) {
      logError('createCategoria', e);
      setNomeError(getErrorMessage(e, 'Não foi possível criar a categoria.'));
    } finally {
      setSaving(false);
    }
  };

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
    <FlatList
      data={categorias}
      keyExtractor={(c) => c._id}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
      keyboardShouldPersistTaps='handled'
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.formTitle}>Nova categoria</Text>
          <TextField
            value={nome}
            onChangeText={(t) => {
              setNome(t);
              setNomeError(null);
            }}
            placeholder='Ex.: Poesia'
            error={nomeError}
            returnKeyType='done'
            onSubmitEditing={handleCreate}
            style={{ marginBottom: spacing.md }}
          />
          <Button title='Criar categoria' icon='add' onPress={handleCreate} loading={saving} small />
          <Text style={styles.listTitle}>{categorias.length} categorias</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Ionicons name='pricetag-outline' size={20} color={colors.primary} />
          <Text style={styles.itemName}>{item.nome}</Text>
          <Text style={[styles.itemCount, !counts[item._id] && { color: colors.placeholder }]}>
            {counts[item._id] || 0} {counts[item._id] === 1 ? 'livro' : 'livros'}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  form: { marginBottom: spacing.sm },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  listTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.xl },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.lg, ...shadow },
  itemName: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text },
  itemCount: { fontSize: 13, color: colors.textMuted },
});
