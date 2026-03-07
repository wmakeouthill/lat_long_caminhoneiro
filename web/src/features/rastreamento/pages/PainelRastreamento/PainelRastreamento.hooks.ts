import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { buscarCaminhoneiros } from '../../services/rastreamento.service';
import { useRastreamentoWebSocket } from '../../hooks/useRastreamentoWebSocket';
import type {
  CaminhoneiroComLocalizacao,
  AtualizacaoLocalizacaoWs,
} from '../../types/rastreamento.types';

const CHAVE_QUERY_CAMINHONEIROS = ['caminhoneiros'];

export function usePainelRastreamento() {
  const [caminhoneiroSelecionadoId, setCaminhoneiroSelecionadoId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: caminhoneiros = [], isLoading } = useQuery({
    queryKey: CHAVE_QUERY_CAMINHONEIROS,
    queryFn: buscarCaminhoneiros,
    refetchInterval: 60_000,
  });

  const processarAtualizacaoWs = useCallback(
    (atualizacao: AtualizacaoLocalizacaoWs) => {
      queryClient.setQueryData<CaminhoneiroComLocalizacao[]>(
        CHAVE_QUERY_CAMINHONEIROS,
        (anterior) => {
          if (!anterior) return anterior;
          return anterior.map((c) => {
            if (c.id !== atualizacao.caminhoneiro_id) return c;

            if (!atualizacao.rastreando) {
              return { ...c, rastreando: false };
            }

            return {
              ...c,
              rastreando: true,
              ultima_latitude: atualizacao.latitude,
              ultima_longitude: atualizacao.longitude,
              ultima_velocidade: atualizacao.velocidade,
              ultima_atualizacao: atualizacao.atualizado_em,
            };
          });
        }
      );
    },
    [queryClient]
  );

  useRastreamentoWebSocket(processarAtualizacaoWs);

  const selecionarCaminhoneiro = useCallback((id: string) => {
    setCaminhoneiroSelecionadoId((atual) => atual === id ? null : id);
  }, []);

  const totalAtivos = caminhoneiros.filter((c) => c.rastreando).length;

  return {
    caminhoneiros,
    isLoading,
    totalAtivos,
    caminhoneiroSelecionadoId,
    selecionarCaminhoneiro,
  };
}
