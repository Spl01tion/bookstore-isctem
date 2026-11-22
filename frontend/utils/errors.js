// Em utils/errors.js — transforma erros (axios ou outros) em mensagens claras para o utilizador
import { BASE_URL } from '../api/config';

export const isNetworkError = (error) => !!error?.isAxiosError && !error.response;

export function getErrorMessage(error, fallback = 'Ocorreu um erro inesperado.') {
  if (!error) return fallback;

  if (error.isSessionExpired) {
    return 'A sua sessão expirou. Inicie sessão novamente.';
  }

  if (error.isAxiosError && !error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'O servidor demorou demasiado a responder. Tente novamente.';
    }
    return `Sem ligação ao servidor (${BASE_URL}). Confirme que o backend está a correr e que o telemóvel está na mesma rede Wi-Fi que o PC.`;
  }

  const status = error.response?.status;
  const serverMessage = error.response?.data?.message;

  switch (true) {
    case status === 400 || status === 409:
      return serverMessage || 'Os dados enviados não são válidos.';
    case status === 401:
      return serverMessage || 'Sessão inválida. Inicie sessão novamente.';
    case status === 403:
      return 'Não tem permissão para esta ação. Apenas administradores.';
    case status === 404:
      return serverMessage || 'Não encontrado.';
    case status >= 500:
      return 'Erro no servidor. Tente novamente dentro de momentos.';
    default:
      return serverMessage || error.message || fallback;
  }
}

// Regista detalhes técnicos na consola (só em desenvolvimento)
export function logError(context, error) {
  if (__DEV__) {
    console.warn(
      `[${context}]`,
      error?.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error?.message || error
    );
  }
}
