// Em app/admin/redefinirSenha.jsx — o administrador define uma nova password para um utilizador
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { redefinirSenhaAdmin } from '../../api/api';
import { useToast } from '../../components/Toast';
import { Button, InlineError, TextField } from '../../components/ui';
import { getErrorMessage, logError } from '../../utils/errors';
import { colors, radius, spacing } from '../../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function RedefinirSenhaScreen() {
  const toast = useToast();
  const [form, setForm] = useState({ email: '', senha: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (v) => {
    setForm((f) => ({ ...f, [field]: v }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    setFormError(null);
  };

  const submit = async () => {
    const e = {};
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = 'Indique um email válido.';
    if (form.senha.length < 6) e.senha = 'A password deve ter pelo menos 6 caracteres.';
    if (form.confirm !== form.senha) e.confirm = 'As passwords não coincidem.';
    setErrors(e);
    if (Object.keys(e).length) return;

    const email = form.email.trim().toLowerCase();
    Alert.alert('Confirmar', `Definir uma nova password para ${email}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Redefinir',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await redefinirSenhaAdmin(email, form.senha);
            toast.success(`Password de ${email} redefinida.`);
            setForm({ email: '', senha: '', confirm: '' });
          } catch (err) {
            logError('redefinirSenha', err);
            if (err.response?.status === 404) setErrors({ email: 'Não existe nenhum utilizador com este email.' });
            else setFormError(getErrorMessage(err, 'Não foi possível redefinir a password.'));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.info}>
          <Ionicons name='shield-checkmark-outline' size={20} color={colors.info} />
          <Text style={styles.infoText}>
            A nova password substitui a atual de imediato. Comunique-a ao utilizador por um canal seguro.
          </Text>
        </View>

        <InlineError message={formError} />

        <TextField
          label='Email do utilizador'
          icon='mail-outline'
          value={form.email}
          onChangeText={set('email')}
          error={errors.email}
          placeholder='nome@isctem.ac.mz'
          keyboardType='email-address'
          autoCapitalize='none'
          autoCorrect={false}
        />
        <TextField
          label='Nova password'
          icon='lock-closed-outline'
          value={form.senha}
          onChangeText={set('senha')}
          error={errors.senha}
          placeholder='Mínimo 6 caracteres'
          secureToggle
          autoCapitalize='none'
        />
        <TextField
          label='Confirmar nova password'
          icon='lock-closed-outline'
          value={form.confirm}
          onChangeText={set('confirm')}
          error={errors.confirm}
          placeholder='Repita a password'
          secureToggle
          autoCapitalize='none'
        />

        <Button title='Redefinir password' icon='key-outline' onPress={submit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg },
  info: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  infoText: { flex: 1, color: colors.info, fontSize: 13, lineHeight: 19 },
});
