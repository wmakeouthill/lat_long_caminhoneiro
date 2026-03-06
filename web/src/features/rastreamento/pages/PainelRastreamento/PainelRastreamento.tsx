import { MapaCaminhoneiros } from '../../components/MapaCaminhoneiros';
import { CartaoCaminhoneiro } from '../../components/CartaoCaminhoneiro';
import { estilos } from './PainelRastreamento.styles';
import { usePainelRastreamento } from './PainelRastreamento.hooks';

export function PainelRastreamento() {
  const {
    caminhoneiros,
    isLoading,
    totalAtivos,
    caminhoneiroSelecionadoId,
    selecionarCaminhoneiro,
  } = usePainelRastreamento();

  return (
    <div style={estilos.container}>
      <header style={estilos.cabecalho}>
        <span style={estilos.titulo}>🚚 Rastreamento</span>
        <span style={estilos.contadorAtivos}>
          {totalAtivos} ativo{totalAtivos !== 1 ? 's' : ''}
        </span>
      </header>

      <div style={estilos.corpo}>
        <aside style={estilos.painelLateral}>
          <div style={estilos.tituloPainel}>
            Caminhoneiros ({caminhoneiros.length})
          </div>
          <div style={estilos.listaCaminhoneiros}>
            {isLoading && (
              <p style={estilos.semCaminhoneiros}>Carregando...</p>
            )}
            {!isLoading && caminhoneiros.length === 0 && (
              <p style={estilos.semCaminhoneiros}>Nenhum caminhoneiro cadastrado.</p>
            )}
            {caminhoneiros.map((caminhoneiro) => (
              <CartaoCaminhoneiro
                key={caminhoneiro.id}
                caminhoneiro={caminhoneiro}
                selecionado={caminhoneiro.id === caminhoneiroSelecionadoId}
                onClick={() => selecionarCaminhoneiro(caminhoneiro.id)}
              />
            ))}
          </div>
        </aside>

        <main style={estilos.containerMapa}>
          <MapaCaminhoneiros
            caminhoneiros={caminhoneiros}
            caminhoneiroSelecionadoId={caminhoneiroSelecionadoId}
            onSelecionar={selecionarCaminhoneiro}
          />
        </main>
      </div>
    </div>
  );
}
