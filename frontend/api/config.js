// Em api/config.js
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
