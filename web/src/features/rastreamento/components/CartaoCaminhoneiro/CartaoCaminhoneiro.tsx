import React from 'react';
import { estilos } from './CartaoCaminhoneiro.styles';
import type { CartaoCaminhoneiroProps } from './CartaoCaminhoneiro.types';

export function CartaoCaminhoneiro({ caminhoneiro, selecionado, onClick }: CartaoCaminhoneiroProps) {
  const atualizadoEm = caminhoneiro.ultima_atualizacao
    ? new Date(caminhoneiro.ultima_atualizacao).toLocaleTimeString('pt-BR')
    : null;

  return (
    <div style={estilos.cartao(selecionado)} onClick={onClick} role="button" tabIndex={0}>
      <div style={estilos.cabecalho}>
        <div style={estilos.indicadorStatus(caminhoneiro.rastreando)} />
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
