import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const CHAVE_TOKEN = 'lat_long_access_token';

interface DadosCaminhoneiro {
  id: string;
  nome: string;
  email: string;
  fotoUrl: string | null;
}

interface AuthState {
  accessToken: string | null;
  caminhoneiro: DadosCaminhoneiro | null;
  carregarTokenSalvo: () => Promise<void>;
  salvarAutenticacao: (token: string, caminhoneiro: DadosCaminhoneiro) => Promise<void>;
  limparAutenticacao: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  caminhoneiro: null,

  carregarTokenSalvo: async () => {
    const token = await SecureStore.getItemAsync(CHAVE_TOKEN);
    if (token) {
      set({ accessToken: token });
    }
  },

  salvarAutenticacao: async (token: string, caminhoneiro: DadosCaminhoneiro) => {
    await SecureStore.setItemAsync(CHAVE_TOKEN, token);
    set({ accessToken: token, caminhoneiro });
  },

  limparAutenticacao: async () => {
    await SecureStore.deleteItemAsync(CHAVE_TOKEN);
    set({ accessToken: null, caminhoneiro: null });
  },
}));
