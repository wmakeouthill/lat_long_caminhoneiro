export const estilos = {
  cartao: (selecionado: boolean, cor: string): React.CSSProperties => ({
    padding: '12px 16px',
    marginBottom: 8,
    borderRadius: 8,
    cursor: 'pointer',
    backgroundColor: selecionado ? '#16213e' : '#0f3460',
    borderLeft: `4px solid ${selecionado ? cor : 'transparent'}`,
    transition: 'all 0.2s',
  }),
  cabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  } as React.CSSProperties,
  indicadorStatus: (rastreando: boolean, cor: string): React.CSSProperties => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: rastreando ? cor : '#555577',
    flexShrink: 0,
  }),
  nome: {
    fontWeight: 600,
    fontSize: 14,
    color: '#ffffff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  info: {
    fontSize: 12,
    color: '#8888aa',
    marginTop: 2,
  } as React.CSSProperties,
} as const;
