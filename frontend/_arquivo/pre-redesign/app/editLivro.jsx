// Em app/editLivro.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { updateLivro, getAllCategorias } from '../api/api';

const EditLivroScreen = () => {
  // useLocalSearchParams pega os parâmetros passados na navegação
  const params = useLocalSearchParams();
  const livroParaEditar = params.livro ? JSON.parse(params.livro) : null;

  const [titulo, setTitulo] = useState('');
  const [autores, setAutores] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUri, setImagemUri] = useState('');
  // ... outros states para os campos
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Efeito para preencher o formulário com os dados do livro a editar
  useEffect(() => {
    if (livroParaEditar) {
      setTitulo(livroParaEditar.titulo);
      setAutores(livroParaEditar.autores);
      setDescricao(livroParaEditar.descricao);
      setImagemUri(livroParaEditar.imagem_uri);
      // Preencha os outros campos aqui
      // Define a categoria inicial do livro
      if (livroParaEditar.categoria && livroParaEditar.categoria.length > 0) {
        setSelectedCategoria(
          livroParaEditar.categoria[0]._id || livroParaEditar.categoria[0]
        );
      }
    }

    // Busca todas as categorias para o dropdown
    const fetchCategorias = async () => {
      try {
        const response = await getAllCategorias();
        setCategorias(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategorias();
  }, [livroParaEditar]);

  const handleUpdateLivro = async () => {
    if (!titulo || !autores) {
      Alert.alert('Erro', 'Título e Autor são obrigatórios.');
      return;
    }

    setLoading(true);

    const livroData = {
      titulo,
      autores,
      descricao,
      imagem_uri: imagemUri,
      categoria: [selectedCategoria],
      // Adicione outros campos aqui se os tiver no formulário
    };

    try {
      await updateLivro(livroParaEditar._id, livroData);
      Alert.alert('Sucesso!', 'O livro foi atualizado com sucesso.');
      router.back(); // Volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o livro.');
      console.error('Erro ao atualizar livro:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  if (!livroParaEditar) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Erro: Nenhum livro para editar.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Editar "{livroParaEditar.titulo}"</Text>

        <TextInput
          style={styles.input}
          placeholder='Título do Livro'
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder='Autor(es)'
          value={autores}
          onChangeText={setAutores}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder='Descrição'
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={styles.input}
          placeholder='URL da Imagem'
          value={imagemUri}
          onChangeText={setImagemUri}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategoria}
            onValueChange={(itemValue) => setSelectedCategoria(itemValue)}
          >
            {categorias.map((cat) => (
              <Picker.Item key={cat._id} label={cat.nome} value={cat._id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdateLivro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Use os mesmos estilos da tela de criação de livro, eles são muito semelhantes
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  scrollContainer: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
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
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5a3e9c',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default EditLivroScreen;
