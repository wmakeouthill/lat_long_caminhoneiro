import Constants from 'expo-constants';

export const API_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://localhost:8000';

export const GOOGLE_WEB_CLIENT_ID: string =
  Constants.expoConfig?.extra?.googleWebClientId ?? '';

export const LOCALIZACAO_TASK_NAME = 'TAREFA_RASTREAMENTO_LOCALIZACAO';

export const INTERVALO_RASTREAMENTO_MS = 30_000; // 30 segundos
