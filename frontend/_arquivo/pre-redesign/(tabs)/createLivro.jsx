// Em app/createLivro.jsx
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
import { useRouter } from 'expo-router';
import { createLivro, getAllCategorias } from '../../api/api';

const CreateLivroScreen = () => {
  const [titulo, setTitulo] = useState('');
  const [autores, setAutores] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUri, setImagemUri] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [publiData, setPubliData] = useState('');
  const [editora, setEditora] = useState('');
  const [pag, setPag] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Busca as categorias da API quando a tela é montada
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await getAllCategorias();
        setCategorias(response.data);
        // Define a primeira categoria como selecionada por padrão
        if (response.data.length > 0) {
          setSelectedCategoria(response.data[0]._id);
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar as categorias.');
        console.error('Erro ao buscar categorias:', error);
      }
    };
    fetchCategorias();
  }, []);

  const handleCreateLivro = async () => {
    // Validação simples
    if (!titulo || !autores || !descricao || !selectedCategoria || !imagemUri) {
      Alert.alert(
        'Campos Obrigatórios',
        'Título, Autor, Descrição, Categoria e Imagem URI são obrigatórios.'
      );
      return;
    }

    setLoading(true);

    const livroData = {
      titulo,
      autores,
      descricao,
      imagem_uri: imagemUri,
      download_link: downloadLink,
      publiData: publiData ? new Date(publiData) : new Date(), // Converte a data ou usa a data atual
      editora,
      pag: pag ? Number(pag) : 0,
      categoria: [selectedCategoria], // A API espera um array de IDs
    };

    try {
      await createLivro(livroData);
      Alert.alert('Sucesso!', 'O livro foi registado com sucesso.');
      router.back(); // Volta para a tela anterior
    } catch (error) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível registar o livro.');
      console.error('Erro ao criar livro:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Registar Novo Livro</Text>

        <TextInput
          style={styles.input}
          placeholder='Título do Livro *'
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={styles.input}
          placeholder='Autor(es) *'
          value={autores}
          onChangeText={setAutores}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder='Descrição *'
          multiline
          value={descricao}
          onChangeText={setDescricao}
        />
        <TextInput
          style={styles.input}
          placeholder='URL da Imagem da Capa *'
          value={imagemUri}
          onChangeText={setImagemUri}
        />
        <TextInput
          style={styles.input}
          placeholder='Link para Download (Opcional)'
          value={downloadLink}
          onChangeText={setDownloadLink}
        />
        <TextInput
          style={styles.input}
          placeholder='Ano de Publicação (ex: 2023)'
          keyboardType='numeric'
          value={publiData}
          onChangeText={setPubliData}
        />
        <TextInput
          style={styles.input}
          placeholder='Editora (Opcional)'
          value={editora}
          onChangeText={setEditora}
        />
        <TextInput
          style={styles.input}
          placeholder='Nº de Páginas (Opcional)'
          keyboardType='numeric'
          value={pag}
          onChangeText={setPag}
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCategoria}
            onValueChange={(itemValue, itemIndex) =>
              setSelectedCategoria(itemValue)
            }
          >
            {categorias.map((cat) => (
              <Picker.Item key={cat._id} label={cat.nome} value={cat._id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateLivro}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.buttonText}>Registar Livro</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos para a tela de criação ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  scrollContainer: {
    padding: 20,
  },
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
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

export default CreateLivroScreen;
