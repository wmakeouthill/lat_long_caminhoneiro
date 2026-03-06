import { apiClient } from '@/shared/services/api.service';
import type { CaminhoneiroComLocalizacao } from '../types/rastreamento.types';

export async function buscarCaminhoneiros(): Promise<CaminhoneiroComLocalizacao[]> {
  const { data } = await apiClient.get<CaminhoneiroComLocalizacao[]>('/caminhoneiros');
  return data;
}
