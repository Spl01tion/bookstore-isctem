// Em api/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from './config';

export { BASE_URL };

if (__DEV__) console.log('API BASE_URL:', BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// --- Pedido: junta o access token guardado ---
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Resposta: se o access token expirou, renova-o com o refresh token e repete o pedido ---
let onSessionExpired = null;
export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

let refreshing = null;
const AUTH_ROUTES = /\/(login|signup|register|refresh)$/;

async function renewAccessToken() {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) throw new Error('Sem refresh token');

  const { data } = await axios.post(`${BASE_URL}/refresh`, { refreshToken }, { timeout: 10000 });
  await SecureStore.setItemAsync('userToken', data.accessToken);
  await SecureStore.setItemAsync('refreshToken', data.refreshToken);
  return data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const shouldRefresh =
      error.response?.status === 401 && original && !original._retry && !AUTH_ROUTES.test(original.url || '');

    if (!shouldRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      refreshing = refreshing || renewAccessToken();
      const newToken = await refreshing;
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      error.isSessionExpired = true;
      onSessionExpired?.();
      return Promise.reject(error);
    } finally {
      refreshing = null;
    }
  }
);

// --- Autenticação e perfil ---
export const login = (email, password) => apiClient.post('/login', { email, password });
export const signup = (userData) => apiClient.post('/signup', userData);
export const getUserProfile = () => apiClient.get('/profile');

// --- Livros ---
export const getAllLivros = (params) => apiClient.get('/livros', { params });
export const searchLivros = (filters) => apiClient.post('/search', filters);
export const createLivro = (livroData) => apiClient.post('/createLivro', livroData);
export const updateLivro = (livroId, livroData) => apiClient.put(`/updateLivro/${livroId}`, livroData);

// --- Categorias ---
export const getAllCategorias = () => apiClient.get('/categorias');
export const createCategoria = (nome) => apiClient.post('/categorias', { nome });

// --- Favoritos ---
export const getFavoriteBooks = () => apiClient.get('/fav');
export const addFavoriteBook = (livroId) => apiClient.post('/addfav', { livroId });
export const removeFavoriteBook = (livroId) => apiClient.delete(`/delfav/${livroId}`);

// --- Administração ---
export const redefinirSenhaAdmin = (email, novaSenha) => apiClient.post('/redefinir-senha', { email, novaSenha });

export default apiClient;
