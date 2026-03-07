import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { LOCALIZACAO_TASK_NAME } from '@/shared/constants/app.constants';
import { enviarLocalizacao } from '../services/tracking.service';

const CHAVE_TOKEN = 'lat_long_access_token';

// IMPORTANTE: Esta definição deve ser chamada no nível raiz do módulo,
// antes de qualquer navegação ser renderizada.
TaskManager.defineTask(
  LOCALIZACAO_TASK_NAME,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
    if (error) {
      console.error('[Rastreamento] Erro na task de localização:', error);
      return;
    }

    const locations = data?.locations;
    if (!locations || locations.length === 0) return;

    const localizacao = locations[locations.length - 1];
    // Lê o token diretamente do SecureStore — o Zustand store não é persistido
    // entre processos, então useAuthStore.getState() retornaria null na background task.
    const token = await SecureStore.getItemAsync(CHAVE_TOKEN);

    if (!token) {
      console.warn('[Rastreamento] Sem token de autenticação. Pulando envio.');
      return;
    }

    try {
      await enviarLocalizacao(
        {
          latitude: localizacao.coords.latitude,
          longitude: localizacao.coords.longitude,
          precisao: localizacao.coords.accuracy,
          velocidade: localizacao.coords.speed
            ? localizacao.coords.speed * 3.6  // m/s → km/h
            : null,
          registrado_em: new Date(localizacao.timestamp).toISOString(),
        },
        token
      );
    } catch (envioErro) {
      console.error('[Rastreamento] Falha ao enviar localização:', envioErro);
    }
  }
);
