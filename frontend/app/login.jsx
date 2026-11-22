// Em app/login.jsx
import React, { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button, InlineError, TextField } from '../components/ui';
import { getErrorMessage, logError } from '../utils/errors';
import { colors, radius, shadow, spacing } from '../constants/theme';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function LoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const { signIn } = useAuth();
  const passwordRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Indique o seu email.';
    else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'Email inválido.';
    if (!password) errors.password = 'Indique a sua password.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await login(email.trim().toLowerCase(), password);
      const { accessToken, refreshToken, user } = response.data;
      await signIn({ accessToken, refreshToken, user });
      toast.success(`Bem-vindo(a), ${user?.name?.split(' ')[0] ?? ''}!`);
      router.replace('/(tabs)');
    } catch (error) {
      logError('login', error);
      setFormError(error.response?.status === 401 ? 'Email ou password incorretos.' : getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
    if (formError) setFormError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name='library' size={40} color='#fff' />
            </View>
            <Text style={styles.appName}>ISCTEM BookStore</Text>
            <Text style={styles.tagline}>A biblioteca digital do teu instituto</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sessão</Text>

            <InlineError message={formError} />

            <TextField
              label='Email'
              icon='mail-outline'
              placeholder='nome@isctem.ac.mz'
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearFieldError('email');
              }}
              error={fieldErrors.email}
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              autoComplete='email'
              textContentType='emailAddress'
              returnKeyType='next'
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
            />

            <TextField
              ref={passwordRef}
              label='Password'
              icon='lock-closed-outline'
              placeholder='A sua password'
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearFieldError('password');
              }}
              error={fieldErrors.password}
              secureToggle
              autoCapitalize='none'
              autoComplete='password'
              textContentType='password'
              returnKeyType='go'
              onSubmitEditing={handleLogin}
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                Alert.alert('Recuperar password', 'Peça a um administrador da biblioteca para redefinir a sua password.')
              }
              style={styles.forgot}
              hitSlop={8}
            >
              <Text style={styles.link}>Esqueceu a password?</Text>
            </Pressable>

            <Button title='Entrar' icon='log-in-outline' onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Pressable onPress={() => router.push('/signup')} hitSlop={8} disabled={loading}>
              <Text style={styles.link}>Criar conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadow,
  },
  appName: { fontSize: 26, fontWeight: '800', color: colors.text },
  tagline: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.xl, ...shadow },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  forgot: { alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg },
  link: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: 14 },
});
