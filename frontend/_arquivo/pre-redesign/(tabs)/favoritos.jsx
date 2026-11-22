// Em app/favoritos.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router'; // Hook para recarregar quando a tela ganha foco

import { Ionicons } from '@expo/vector-icons';
import { getFavoriteBooks, removeFavoriteBook } from '../../api/api';

// --- Componente para um item da lista de favoritos ---
const FavoriteBookItem = ({ book, onRemove }) => {
  return (
    <View style={styles.bookItemContainer}>
      <Image
        source={{
          uri:
            book.imagem_uri ||
            'https://via.placeholder.com/80x120.png?text=Capa',
        }}
        style={styles.bookCover}
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.titulo}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.autores}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(book._id, book.titulo)}
        style={styles.removeButton}
      >
        <Ionicons name='trash-outline' size={24} color='#ff6b6b' />
      </TouchableOpacity>
    </View>
  );
};

// --- Componente Principal da Tela de Favoritos ---
const FavoritosScreen = () => {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar os favoritos da API
  const fetchFavorites = useCallback(async () => {
    try {
      setError(null);
      const response = await getFavoriteBooks(); // Lembre-se que o token é adicionado automaticamente pelo interceptor
      setFavoriteBooks(response.data);
    } catch (err) {
      setError('Não foi possível carregar os favoritos.');
      console.error('Erro ao buscar favoritos:', err.response?.data || err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // useFocusEffect é um hook do Expo Router que executa a função
  // toda vez que o usuário NAVEGA para esta tela. Perfeito para manter os dados atualizados.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFavorites();
    }, [fetchFavorites])
  );

  // Função para remover um favorito (precisará ser implementada na API)
  const handleRemoveFavorite = (bookId, bookTitle) => {
    Alert.alert(
      'Remover Favorito',
      `Tem certeza que deseja remover "${bookTitle}" dos seus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          onPress: async () => {
            try {
              // --- AQUI ESTÁ A MUDANÇA ---
              // Chama a nossa nova função da API
              await removeFavoriteBook(bookId);

              // Se a chamada for bem-sucedida, remove o livro da lista localmente
              // para uma atualização visual imediata.
              setFavoriteBooks((prevBooks) =>
                prevBooks.filter((book) => book._id !== bookId)
              );

              Alert.alert(
                'Sucesso',
                `"${bookTitle}" foi removido dos favoritos.`
              );
            } catch (error) {
              console.error(
                'Erro ao remover favorito:',
                error.response?.data || error
              );
              Alert.alert(
                'Erro',
                'Não foi possível remover o livro dos favoritos.'
              );
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size='large' color='#6247AA' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favoriteBooks}
        renderItem={({ item }) => (
          <FavoriteBookItem book={item} onRemove={handleRemoveFavorite} />
        )}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={[styles.container, styles.centered, { marginTop: -50 }]}>
            <Ionicons name='heart-dislike-outline' size={80} color='#ccc' />
            <Text style={styles.emptyText}>
              A sua lista de favoritos está vazia.
            </Text>
            <Text style={styles.emptySubText}>
              Adicione livros tocando no coração.
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchFavorites}
            tintColor='#6247AA'
          />
        }
      />
    </SafeAreaView>
  );
};

// --- Estilos para a Tela de Favoritos ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
  },
  bookItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bookCover: {
    width: 60,
    height: 90,
    borderRadius: 5,
    marginRight: 15,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookAuthor: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  removeButton: {
    padding: 10,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#aaa',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});

export default FavoritosScreen;
