// Em hooks/useFavorites.js — lista de favoritos com atualização otimista
import { useCallback, useState } from 'react';
import { addFavoriteBook, getFavoriteBooks, removeFavoriteBook } from '../api/api';
import { useToast } from '../components/Toast';
import { getErrorMessage, logError } from '../utils/errors';

export function useFavorites() {
  const toast = useToast();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [pendingId, setPendingId] = useState(null);

  const loadFavorites = useCallback(async () => {
    try {
      const { data } = await getFavoriteBooks();
      setFavoriteIds(new Set(data.map((b) => b._id)));
      return data;
    } catch (error) {
      logError('loadFavorites', error);
      throw error;
    }
  }, []);

  const toggleFavorite = useCallback(
    async (book) => {
      const wasFavorite = favoriteIds.has(book._id);
      const apply = (fav) =>
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          fav ? next.add(book._id) : next.delete(book._id);
          return next;
        });

      apply(!wasFavorite); // mostra a mudança logo
      setPendingId(book._id);
      try {
        if (wasFavorite) {
          await removeFavoriteBook(book._id);
          toast.info(`"${book.titulo}" removido dos favoritos.`);
        } else {
          await addFavoriteBook(book._id);
          toast.success(`"${book.titulo}" adicionado aos favoritos.`);
        }
      } catch (error) {
        logError('toggleFavorite', error);
        apply(wasFavorite); // desfaz se o servidor falhar
        toast.error(getErrorMessage(error, 'Não foi possível atualizar os favoritos.'));
      } finally {
        setPendingId(null);
      }
    },
    [favoriteIds, toast]
  );

  return { favoriteIds, loadFavorites, toggleFavorite, pendingId };
}
