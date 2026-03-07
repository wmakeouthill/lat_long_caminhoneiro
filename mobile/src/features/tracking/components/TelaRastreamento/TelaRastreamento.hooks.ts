import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/shared/store/auth.store';
import {
  solicitarPermissoesLocalizacao,
  iniciarRastreamento,
  pararRastreamento,
  verificarSeRastreando,
} from '../../services/tracking.service';

export function useTelaRastreamento() {
  const [rastreando, setRastreando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const caminhoneiro = useAuthStore((s) => s.caminhoneiro);
  const accessToken = useAuthStore((s) => s.accessToken);
  const limparAutenticacao = useAuthStore((s) => s.limparAutenticacao);

  useEffect(() => {
    verificarSeRastreando().then(setRastreando);
  }, []);

  const alternarRastreamento = useCallback(async () => {
    setCarregando(true);

    try {
      if (rastreando) {
        await pararRastreamento(accessToken ?? '');
        setRastreando(false);
        setUltimaAtualizacao(null);
      } else {
        const permissaoOk = await solicitarPermissoesLocalizacao();
        if (!permissaoOk) {
          Alert.alert(
            'Permissão necessária',
            'Para rastrear sua rota, o app precisa de acesso à localização em segundo plano. Habilite nas configurações do Android.'
          );
          return;
        }
        await iniciarRastreamento();
        setRastreando(true);
        setUltimaAtualizacao(new Date());
      }
    } catch (erro) {
      Alert.alert('Erro', 'Não foi possível alterar o rastreamento. Tente novamente.');
      console.error('[TelaRastreamento] Erro ao alterar rastreamento:', erro);
    } finally {
      setCarregando(false);
    }
  }, [rastreando, accessToken]);

  const fazerLogout = useCallback(async () => {
    if (rastreando) {
      await pararRastreamento(accessToken ?? '');
    }
    await limparAutenticacao();
  }, [rastreando, accessToken, limparAutenticacao]);

  return {
    rastreando,
    carregando,
    ultimaAtualizacao,
    caminhoneiro,
    alternarRastreamento,
    fazerLogout,
  };
}
