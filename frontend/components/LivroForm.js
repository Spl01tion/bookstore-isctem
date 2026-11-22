// Em components/LivroForm.js — formulário partilhado por "Adicionar" e "Editar" livro
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getAllCategorias } from '../api/api';
import { BookCover, Button, Chip, InlineError, TextField } from './ui';
import { getErrorMessage, logError } from '../utils/errors';
import { colors, radius, spacing } from '../constants/theme';

const URL_REGEX = /^https?:\/\/\S+$/i;
const CURRENT_YEAR = new Date().getFullYear();

const fromLivro = (livro) => ({
  titulo: livro?.titulo ?? '',
  autores: livro?.autores ?? '',
  descricao: livro?.descricao ?? '',
  imagem_uri: livro?.imagem_uri ?? '',
  download_link: livro?.download_link ?? '',
  ano: livro?.publiData ? String(new Date(livro.publiData).getFullYear()) : '',
  editora: livro?.editora ?? '',
  pag: livro?.pag ? String(livro.pag) : '',
  lingua: livro?.lingua ?? 'pt',
  categorias: (livro?.categoria ?? []).map((c) => c._id ?? c),
});

function validate(f) {
  const e = {};
  if (!f.titulo.trim()) e.titulo = 'O título é obrigatório.';
  if (!f.autores.trim()) e.autores = 'Indique pelo menos um autor.';
  if (f.descricao.trim().length < 10) e.descricao = 'A descrição deve ter pelo menos 10 caracteres.';
  if (!URL_REGEX.test(f.imagem_uri.trim())) e.imagem_uri = 'Indique um URL válido (http:// ou https://).';
  if (f.download_link.trim() && !URL_REGEX.test(f.download_link.trim())) e.download_link = 'URL inválido.';
  if (!/^\d{4}$/.test(f.ano) || Number(f.ano) > CURRENT_YEAR || Number(f.ano) < 1000) e.ano = `Ano entre 1000 e ${CURRENT_YEAR}.`;
  if (f.pag && !(Number.isInteger(Number(f.pag)) && Number(f.pag) > 0)) e.pag = 'Número de páginas inválido.';
  if (f.categorias.length === 0) e.categorias = 'Escolha pelo menos uma categoria.';
  return e;
}

const toPayload = (f) => ({
  titulo: f.titulo.trim(),
  autores: f.autores.trim(),
  descricao: f.descricao.trim(),
  imagem_uri: f.imagem_uri.trim(),
  download_link: f.download_link.trim() || null,
  publiData: new Date(`${f.ano}-01-01T00:00:00Z`).toISOString(),
  editora: f.editora.trim() || undefined,
  pag: f.pag ? Number(f.pag) : undefined,
  lingua: f.lingua.trim() || 'pt',
  categoria: f.categorias,
});

export function LivroForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState(() => fromLivro(initial));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [catStatus, setCatStatus] = useState('loading');

  const loadCategorias = async () => {
    setCatStatus('loading');
    try {
      const { data } = await getAllCategorias();
      setCategorias(data);
      setCatStatus('ready');
    } catch (error) {
      logError('getAllCategorias', error);
      setCatStatus(getErrorMessage(error, 'Não foi possível carregar as categorias.'));
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const toggleCategoria = (id) => {
    set('categorias')(form.categorias.includes(id) ? form.categorias.filter((c) => c !== id) : [...form.categorias, id]);
  };

  const handleSubmit = async () => {
    setFormError(null);
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) {
      setFormError('Corrija os campos assinalados a vermelho.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit(toPayload(form));
    } catch (error) {
      logError('LivroForm.submit', error);
      setFormError(getErrorMessage(error, 'Não foi possível guardar o livro.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <InlineError message={formError} />

        <View style={styles.preview}>
          <BookCover uri={URL_REGEX.test(form.imagem_uri) ? form.imagem_uri : null} style={styles.previewCover} />
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {form.titulo || 'Título do livro'}
            </Text>
            <Text style={styles.previewAuthor} numberOfLines={1}>
              {form.autores || 'Autor'}
            </Text>
          </View>
        </View>

        <Text style={styles.section}>Informação principal</Text>
        <TextField label='Título *' value={form.titulo} onChangeText={set('titulo')} error={errors.titulo} placeholder='Ex.: Terra Sonâmbula' />
        <TextField label='Autor(es) *' value={form.autores} onChangeText={set('autores')} error={errors.autores} placeholder='Ex.: Mia Couto' />
        <TextField
          label='Descrição *'
          value={form.descricao}
          onChangeText={set('descricao')}
          error={errors.descricao}
          placeholder='Sinopse do livro'
          multiline
          hint={`${form.descricao.trim().length} caracteres (mínimo 10)`}
        />

        <Text style={styles.section}>Categorias *</Text>
        {catStatus === 'loading' ? (
          <ActivityIndicator color={colors.primary} style={{ alignSelf: 'flex-start', marginBottom: spacing.lg }} />
        ) : catStatus !== 'ready' ? (
          <InlineError message={catStatus} onRetry={loadCategorias} />
        ) : (
          <View style={[styles.chips, errors.categorias && styles.chipsError]}>
            {categorias.map((c) => (
              <View key={c._id} style={{ marginBottom: spacing.sm }}>
                <Chip
                  label={c.nome}
                  icon={form.categorias.includes(c._id) ? 'checkmark' : undefined}
                  active={form.categorias.includes(c._id)}
                  onPress={() => toggleCategoria(c._id)}
                />
              </View>
            ))}
          </View>
        )}
        {errors.categorias && <Text style={styles.chipError}>{errors.categorias}</Text>}

        <Text style={styles.section}>Ficheiros</Text>
        <TextField
          label='URL da capa *'
          value={form.imagem_uri}
          onChangeText={set('imagem_uri')}
          error={errors.imagem_uri}
          placeholder='https://...'
          autoCapitalize='none'
          keyboardType='url'
        />
        <TextField
          label='Link de download'
          value={form.download_link}
          onChangeText={set('download_link')}
          error={errors.download_link}
          placeholder='https://... (opcional)'
          autoCapitalize='none'
          keyboardType='url'
        />

        <Text style={styles.section}>Detalhes</Text>
        <View style={styles.rowFields}>
          <TextField label='Ano *' value={form.ano} onChangeText={set('ano')} error={errors.ano} placeholder='2024' keyboardType='number-pad' maxLength={4} style={{ flex: 1 }} />
          <TextField label='Páginas' value={form.pag} onChangeText={set('pag')} error={errors.pag} placeholder='Ex.: 250' keyboardType='number-pad' style={{ flex: 1 }} />
        </View>
        <View style={styles.rowFields}>
          <TextField label='Editora' value={form.editora} onChangeText={set('editora')} placeholder='Opcional' style={{ flex: 1 }} />
          <TextField label='Língua' value={form.lingua} onChangeText={set('lingua')} placeholder='pt' autoCapitalize='none' style={{ flex: 1 }} />
        </View>

        <Button title={submitLabel} icon='save-outline' onPress={handleSubmit} loading={saving} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  preview: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
  previewCover: { width: 60, aspectRatio: 2 / 3, borderRadius: radius.sm },
  previewTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  previewAuthor: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  section: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm, padding: 2, borderRadius: radius.md },
  chipsError: { borderWidth: 1.5, borderColor: colors.danger, padding: spacing.sm, paddingBottom: 0 },
  chipError: { color: colors.danger, fontSize: 13, marginBottom: spacing.md },
  rowFields: { flexDirection: 'row', gap: spacing.md },
});
