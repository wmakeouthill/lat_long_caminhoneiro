import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '@/shared/store/auth.store';
import { apiClient } from '@/shared/services/api.service';
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
  const [inputNome, setInputNome] = useState('');
  const [erroNome, setErroNome] = useState('');
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const caminhoneiro = useAuthStore((s) => s.caminhoneiro);
  const accessToken = useAuthStore((s) => s.accessToken);
  const limparAutenticacao = useAuthStore((s) => s.limparAutenticacao);
  const atualizarNome = useAuthStore((s) => s.atualizarNome);

  useEffect(() => {
    verificarSeRastreando().then(setRastreando);
  }, []);

  useEffect(() => {
    if (caminhoneiro?.nome) setInputNome(caminhoneiro.nome);
  }, [caminhoneiro?.nome]);

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

  const salvarNome = useCallback(async () => {
    const nome = inputNome.trim();
    if (!nome || !caminhoneiro) return;
    setSalvandoNome(true);
    setErroNome('');
    try {
      await apiClient.patch(`/caminhoneiros/${caminhoneiro.id}/nome`, { nome });
      atualizarNome(nome);
      setEditandoNome(false);
    } catch {
      setErroNome('Erro ao salvar. Tente novamente.');
    } finally {
      setSalvandoNome(false);
    }
  }, [inputNome, caminhoneiro, atualizarNome]);

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
    inputNome,
    setInputNome,
    erroNome,
    salvandoNome,
    salvarNome,
    editandoNome,
    setEditandoNome,
  };
}
