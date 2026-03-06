import { apiClient } from '@/shared/services/api.service';
import type { AuthApiResponse } from '../types/auth.types';

export async function autenticarComGoogle(idToken: string): Promise<AuthApiResponse> {
  const { data } = await apiClient.post<AuthApiResponse>('/auth/google', {
    id_token: idToken,
  });
  return data;
}
