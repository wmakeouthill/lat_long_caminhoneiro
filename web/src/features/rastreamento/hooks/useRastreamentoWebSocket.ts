import { useEffect, useRef } from 'react';
import { WS_URL } from '@/shared/constants/app.constants';
import type { AtualizacaoLocalizacaoWs } from '../types/rastreamento.types';

type CallbackAtualizacao = (dados: AtualizacaoLocalizacaoWs) => void;

export function useRastreamentoWebSocket(onAtualizacao: CallbackAtualizacao) {
  const wsRef = useRef<WebSocket | null>(null);
  const tentativasRef = useRef(0);

  useEffect(() => {
    function conectar() {
      const ws = new WebSocket(`${WS_URL}/ws/rastreamento`);
      wsRef.current = ws;

      let intervalo: ReturnType<typeof setInterval> | null = null;

      ws.onopen = () => {
        tentativasRef.current = 0;
        // ping a cada 30s para manter conexão viva
        intervalo = setInterval(() => ws.send('ping'), 30_000);
      };

      ws.onmessage = (evento) => {
        try {
          const dados: AtualizacaoLocalizacaoWs = JSON.parse(evento.data);
          onAtualizacao(dados);
        } catch {
          // mensagem não é JSON (ex: pong) — ignorar
        }
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        if (intervalo !== null) clearInterval(intervalo);
        const atraso = Math.min(1000 * 2 ** tentativasRef.current, 30_000);
        tentativasRef.current += 1;
        setTimeout(conectar, atraso);
      };
    }

    conectar();

    return () => {
      wsRef.current?.close();
    };
  }, [onAtualizacao]);
}
