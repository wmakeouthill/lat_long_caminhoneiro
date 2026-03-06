import axios, { AxiosInstance } from 'axios';
import { API_URL } from '../constants/app.constants';
import { useAuthStore } from '../store/auth.store';

function criarApiClient(): AxiosInstance {
  const cliente = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  cliente.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return cliente;
}

export const apiClient = criarApiClient();
