import axios from 'axios';

// Cliente HTTP que apunta a la API. Adjunta el token automáticamente
// si está en localStorage y maneja errores comunes (401 → logout).
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
});

const TOKEN_KEY = 'mma_admin_token';

export const tokenStore = {
  get: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  set: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  },
};

// Interceptor: agrega el token a cada petición
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: si la API responde 401, limpiamos el token y redirigimos al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      tokenStore.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function extractError(err: unknown, fallback = 'Error inesperado'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[]; error?: string } | undefined;
    if (Array.isArray(data?.message)) return data!.message.join(', ');
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (err.message) return err.message;
  }
  return fallback;
}
