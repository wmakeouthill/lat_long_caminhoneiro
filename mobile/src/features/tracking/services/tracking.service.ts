import * as Location from 'expo-location';
import axios from 'axios';
import { API_URL, LOCALIZACAO_TASK_NAME, INTERVALO_RASTREAMENTO_MS } from '@/shared/constants/app.constants';
import type { PayloadLocalizacao } from '../types/tracking.types';

export async function solicitarPermissoesLocalizacao(): Promise<boolean> {
  const { status: statusUsando } = await Location.requestForegroundPermissionsAsync();
  if (statusUsando !== 'granted') return false;

  const { status: statusBackground } = await Location.requestBackgroundPermissionsAsync();
  return statusBackground === 'granted';
}

export async function iniciarRastreamento(): Promise<void> {
  const jaAtivo = await Location.hasStartedLocationUpdatesAsync(LOCALIZACAO_TASK_NAME);
  if (jaAtivo) return;

  await Location.startLocationUpdatesAsync(LOCALIZACAO_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: INTERVALO_RASTREAMENTO_MS,
    distanceInterval: 0, // envia sempre no intervalo de tempo, independente de distância
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Rastreamento Ativo',
      notificationBody: 'Sua posição está sendo enviada.',
      notificationColor: '#1a1a2e',
    },
    pausesUpdatesAutomatically: false,
  });
}

export async function pararRastreamento(token: string): Promise<void> {
  const jaAtivo = await Location.hasStartedLocationUpdatesAsync(LOCALIZACAO_TASK_NAME);
  if (jaAtivo) {
    await Location.stopLocationUpdatesAsync(LOCALIZACAO_TASK_NAME);
  }
  await axios.delete(`${API_URL}/api/v1/localizacoes/rastreamento`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10_000,
  });
}

export async function verificarSeRastreando(): Promise<boolean> {
  return Location.hasStartedLocationUpdatesAsync(LOCALIZACAO_TASK_NAME);
}

export async function enviarLocalizacao(
  payload: PayloadLocalizacao,
  token: string
): Promise<void> {
  await axios.post(`${API_URL}/api/v1/localizacoes`, payload, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 10_000,
  });
}
