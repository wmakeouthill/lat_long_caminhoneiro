import { estilos } from './CartaoCaminhoneiro.styles';
import type { CartaoCaminhoneiroProps } from './CartaoCaminhoneiro.types';

const PALETA_CORES = ['#3b82f6', '#f97316', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#14b8a6'];

function corCaminhoneiro(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA_CORES[h % PALETA_CORES.length];
}

export function CartaoCaminhoneiro({ caminhoneiro, selecionado, onClick }: CartaoCaminhoneiroProps) {
  const cor = corCaminhoneiro(caminhoneiro.id);

  const atualizadoEm = caminhoneiro.ultima_atualizacao
    ? new Date(caminhoneiro.ultima_atualizacao).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : null;

  return (
    <div style={estilos.cartao(selecionado, cor)} onClick={onClick} role="button" tabIndex={0}>
      <div style={estilos.cabecalho}>
        <div style={estilos.indicadorStatus(caminhoneiro.rastreando, cor)} />
        <span style={estilos.nome}>{caminhoneiro.nome}</span>
      </div>
      <div style={estilos.info}>
        {caminhoneiro.rastreando ? (
          <>
            {caminhoneiro.ultima_velocidade !== null
              ? `${caminhoneiro.ultima_velocidade.toFixed(0)} km/h`
              : 'Rastreando'}
            {atualizadoEm && ` · ${atualizadoEm}`}
          </>
        ) : (
          'Offline'
        )}
      </div>
    </div>
  );
}
