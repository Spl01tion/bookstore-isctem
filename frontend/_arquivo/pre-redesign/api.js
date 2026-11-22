// Em api/api.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// URL da API:
// 1) EXPO_PUBLIC_API_URL (ficheiro frontend/.env), se definido;
// 2) senão, o IP do PC onde corre o `expo start` (o mesmo que o telemóvel já usa
//    para o Metro), na porta 5000 do backend;
// 3) fallback para o emulador Android (10.0.2.2 = localhost do PC).
const API_PORT = 5000;
const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
export const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    (expoHost ? `http://${expoHost}:${API_PORT}` : `http://10.0.2.2:${API_PORT}`);

if (__DEV__) console.log('API BASE_URL:', BASE_URL);

// Cria uma instância do Axios com a URL base pré-configurada
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// --- Interceptor de Requisições ---
// Esta função é executada ANTES de cada requisição ser enviada.
// É o local perfeito para adicionar o token de autorização.
apiClient.interceptors.request.use(
    async (config) => {
        // Pega o token que guardámos no SecureStore
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
            // Se o token existir, adiciona-o ao header de Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Em caso de erro na configuração da requisição
        return Promise.reject(error);
    }
);

// --- Funções Específicas da API ---

// Função para fazer login
export const login = (email, password) => {
    return apiClient.post('/login', { email, password });
};

// Função para buscar os livros favoritos
export const getFavoriteBooks = () => {
    return apiClient.get('/fav');
};

export const getAllCategorias = () => {
    return apiClient.get('/categorias');
};


// Função para adicionar um livro aos favoritos
export const addFavoriteBook = (livroId) => {
    return apiClient.post('/addfav', { livroId });
};

// Função para buscar todos os livros
export const getAllLivros = (params) => {
    // Aceita parâmetros para o filtro via URL (ex: ?search=...)
    return apiClient.get('/livros', { params });
}

export const createLivro = (LivroData) => {
    return apiClient.post('/createLivro', LivroData);
}

export const removeFavoriteBook = (livroId) => {
    // O método é 'delete' e o ID do livro é passado na URL
    return apiClient.delete(`/delfav/${livroId}`);
};
// Função para buscar livros via corpo da requisição
export const searchLivros = (filters) => {
    return apiClient.post('/search', filters);
}

export const getUserProfile = () => {
    return apiClient.get('/profile');
};

export const redefinirSenhaAdmin = (email, novaSenha) => {
    return apiClient.post('/redefinir-senha', { email, novaSenha });
};

export const signup = (userData) => {
    return apiClient.post('/signup', userData);
};

export const updateLivro = (livroId, livroData) => {
    return apiClient.put(`/updateLivro/${livroId}`, livroData);
};

export default apiClient;