import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useEffect, useState } from 'react';
import { GOOGLE_WEB_CLIENT_ID } from '@/shared/constants/app.constants';
import { useAuthStore } from '@/shared/store/auth.store';
import { autenticarComGoogle } from '../../services/auth.service';

GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
});

export function useTelaLogin(onLoginSucesso: () => void) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const salvarAutenticacao = useAuthStore((s) => s.salvarAutenticacao);

  async function iniciarLoginGoogle(): Promise<void> {
    setCarregando(true);
    setErro(null);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        setErro('Não foi possível obter o token do Google.');
        return;
      }

      console.log('[Login] idToken obtido, chamando backend...');
      try {
        const dados = await autenticarComGoogle(idToken);
        await salvarAutenticacao(dados.access_token, {
          id: dados.caminhoneiro.id,
          nome: dados.caminhoneiro.nome,
          email: dados.caminhoneiro.email,
          fotoUrl: dados.caminhoneiro.foto_url,
        });
        onLoginSucesso();
      } catch (backendError: any) {
        console.error('[Login] Erro no backend:', backendError?.response?.status, backendError?.response?.data, backendError?.message);
        setErro('Falha no login. Verifique sua conexão e tente novamente.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // usuário cancelou, não mostrar erro
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // login já em andamento
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErro('Google Play Services não disponível.');
      } else {
        console.error('[Login] Erro:', error?.code, error?.message, JSON.stringify(error));
        setErro('Falha no login. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return {
    carregando,
    erro,
    loginDesabilitado: false,
    iniciarLoginGoogle,
  };
}


