// Em app/forgotPassword.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// Precisamos de adicionar a função à nossa API central
import { redefinirSenhaAdmin } from '../../api/api';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('johndoe@example.com');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email || !novaSenha) {
      Alert.alert(
        'Campos em Falta',
        'Por favor, preencha o email e a nova senha.'
      );
      return;
    }

    setLoading(true);

    try {
      // Chamaria a função da API aqui
      await redefinirSenhaAdmin(email, novaSenha);

      Alert.alert('Sucesso!', `A senha para ${email} foi redefinida.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível redefinir a senha.');
      console.error('Erro na redefinição:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Redefinir Senha</Text>
        <Text style={styles.instructions}>
          Esta é uma ferramenta de demonstração. Insira o email do usuário e a
          nova senha desejada.
        </Text>

        <TextInput
          style={styles.input}
          placeholder='Código de Estudante (Email)'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
        />
        <TextInput
          style={styles.input}
          placeholder='Nova Senha'
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Redefinir Senha</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Estilos para a tela ---

// --- Estilos para a tela ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#6247AA',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
export default ForgotPasswordScreen;
