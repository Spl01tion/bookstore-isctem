// Em app/signup.jsx
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { signup } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, InlineError, TextField } from '../components/ui';
import { getErrorMessage, logError } from '../utils/errors';
import { colors, radius, shadow, spacing } from '../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function SignupScreen() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useAuth();
  const refs = { email: useRef(null), password: useRef(null), confirm: useRef(null) };

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
    if (formError) setFormError(null);
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'O nome deve ter pelo menos 2 caracteres.';
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = 'Indique um email válido.';
    if (form.password.length < 6) e.password = 'A password deve ter pelo menos 6 caracteres.';
    if (form.confirm !== form.password) e.confirm = 'As passwords não coincidem.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async () => {
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      const { accessToken, refreshToken, user } = response.data;
      await signIn({ accessToken, refreshToken, user });
      toast.success('Conta criada com sucesso!');
      router.replace('/(tabs)');
    } catch (error) {
      logError('signup', error);
      if (error.response?.status === 409) {
        setFieldErrors((e) => ({ ...e, email: 'Este email já está registado.' }));
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
        <View style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Registe-se para explorar e guardar os seus livros favoritos.</Text>

          <InlineError message={formError} />

          <TextField
            label='Nome completo'
            icon='person-outline'
            placeholder='O seu nome'
            value={form.name}
            onChangeText={update('name')}
            error={fieldErrors.name}
            autoComplete='name'
            returnKeyType='next'
            onSubmitEditing={() => refs.email.current?.focus()}
          />
          <TextField
            ref={refs.email}
            label='Email'
            icon='mail-outline'
            placeholder='nome@isctem.ac.mz'
            value={form.email}
            onChangeText={update('email')}
            error={fieldErrors.email}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
            autoComplete='email'
            returnKeyType='next'
            onSubmitEditing={() => refs.password.current?.focus()}
          />
          <TextField
            ref={refs.password}
            label='Password'
            icon='lock-closed-outline'
            placeholder='Mínimo 6 caracteres'
            value={form.password}
            onChangeText={update('password')}
            error={fieldErrors.password}
            secureToggle
            autoCapitalize='none'
            autoComplete='new-password'
            returnKeyType='next'
            onSubmitEditing={() => refs.confirm.current?.focus()}
          />
          <TextField
            ref={refs.confirm}
            label='Confirmar password'
            icon='lock-closed-outline'
            placeholder='Repita a password'
            value={form.confirm}
            onChangeText={update('confirm')}
            error={fieldErrors.confirm}
            secureToggle
            autoCapitalize='none'
            returnKeyType='go'
            onSubmitEditing={handleSignup}
          />

          <Button title='Criar conta' icon='person-add-outline' onPress={handleSignup} loading={loading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?</Text>
          <Pressable onPress={() => router.replace('/login')} hitSlop={8}>
            <Text style={styles.link}>Iniciar sessão</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, ...shadow },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
});
