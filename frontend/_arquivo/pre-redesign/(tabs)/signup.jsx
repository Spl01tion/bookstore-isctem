// Em app/signup.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signup } from '../../api/api';

const SignupScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Usado para o "código de estudante"
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    // Validação dos campos
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Campos em Falta', 'Por favor, preencha todos os campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        'Erro de Senha',
        'As senhas não coincidem. Por favor, verifique.'
      );
      return;
    }

    setLoading(true);

    const userData = {
      name,
      email,
      password,
    };

    try {
      await signup(userData);
      Alert.alert(
        'Registo Bem-sucedido!',
        'A sua conta foi criada. Agora pode fazer login.',
        [{ text: 'OK', onPress: () => router.push('/login') }] // Leva para a tela de login
      );
    } catch (error) {
      // Verifica se o erro é de email já existente
      if (error.response && error.response.status === 409) {
        Alert.alert(
          'Erro de Registo',
          'Este código de estudante (email) já está em uso.'
        );
      } else {
        Alert.alert(
          'Erro de Registo',
          'Não foi possível criar a sua conta. Tente novamente.'
        );
      }
      console.error('Erro no registo:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Criar Conta de Estudante</Text>

        <TextInput
          style={styles.input}
          placeholder='Nome Completo *'
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder='Código de Estudante (Email) *'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder='Password *'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder='Confirmar Password *'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Registar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.loginText}>Já tem uma conta? Faça Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos semelhantes aos de outras telas de formulário ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6247AA',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#6247AA',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignupScreen;
