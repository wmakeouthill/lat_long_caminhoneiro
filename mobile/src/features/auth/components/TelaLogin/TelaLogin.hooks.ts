import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { GOOGLE_WEB_CLIENT_ID } from '@/shared/constants/app.constants';
import { useAuthStore } from '@/shared/store/auth.store';
import { autenticarComGoogle } from '../../services/auth.service';

WebBrowser.maybeCompleteAuthSession();

export function useTelaLogin(onLoginSucesso: () => void) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const salvarAutenticacao = useAuthStore((s) => s.salvarAutenticacao);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) {
        processarLoginGoogle(idToken);
      }
    }
  }, [response]);

  async function processarLoginGoogle(idToken: string): Promise<void> {
    setCarregando(true);
    setErro(null);

    try {
      const dados = await autenticarComGoogle(idToken);
      await salvarAutenticacao(dados.access_token, {
        id: dados.caminhoneiro.id,
        nome: dados.caminhoneiro.nome,
        email: dados.caminhoneiro.email,
        fotoUrl: dados.caminhoneiro.foto_url,
      });
      onLoginSucesso();
    } catch {
      setErro('Falha no login. Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return {
    carregando,
    erro,
    loginDesabilitado: !request,
    iniciarLoginGoogle: () => promptAsync(),
  };
}
