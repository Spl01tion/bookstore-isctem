// Em app/login.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { login } from '../api/api';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('hericles@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro de Validação', 'Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    try {
      const response = await login(email, password);
      const { accessToken, refreshToken, user } = response.data;

      if (accessToken) {
        await signIn({ accessToken, refreshToken, user });
        router.replace('/(tabs)');
      } else {
        Alert.alert('Falha no Login', 'Token não recebido do servidor.');
      }
    } catch (error) {
      console.warn('Falha no login:', error.response?.data || error.message);
      Alert.alert(
        'Falha no Login',
        error.response
          ? error.response.data?.message || 'Credenciais inválidas.'
          : `Sem ligação ao servidor (${error.message}). Verifique se o backend está a correr e se o telemóvel está na mesma rede.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps='handled'
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Login de Estudante</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Código de Estudante</Text>
              <TextInput
                style={styles.input}
                placeholder='Seu código de estudante'
                placeholderTextColor='#A9A9A9'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder='Sua password'
                placeholderTextColor='#A9A9A9'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>
                Esqueceu a password? Recuperar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    backgroundColor: '#6247AA',
    paddingVertical: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginTop: 20, // Espaçamento entre header e form
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f7f7f7',
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#6247AA',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 58,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#6247AA',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
