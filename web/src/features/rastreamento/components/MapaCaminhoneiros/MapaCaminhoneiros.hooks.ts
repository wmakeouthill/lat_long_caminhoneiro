import { useMemo } from 'react';
import type { CaminhoneiroComLocalizacao } from '../../types/rastreamento.types';

export function useMapaCaminhoneiros(caminhoneiros: CaminhoneiroComLocalizacao[]) {
  const caminhoneirosComPosicao = useMemo(
    () =>
      caminhoneiros.filter(
        (c) => c.ultima_latitude !== null && c.ultima_longitude !== null
      ),
    [caminhoneiros]
  );

  const centroInicial = useMemo((): [number, number] => {
    if (caminhoneirosComPosicao.length === 0) return [-15.7801, -47.9292]; // Brasília
    const primeiro = caminhoneirosComPosicao[0];
    return [primeiro.ultima_latitude!, primeiro.ultima_longitude!];
  }, [caminhoneirosComPosicao]);

  return { caminhoneirosComPosicao, centroInicial };
}
