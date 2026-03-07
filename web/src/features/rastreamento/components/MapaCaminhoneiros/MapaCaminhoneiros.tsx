import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useMapaCaminhoneiros } from './MapaCaminhoneiros.hooks';
import type { MapaCaminhoneirosProps } from './MapaCaminhoneiros.types';
import type { CaminhoneiroComLocalizacao } from '../../types/rastreamento.types';

const PALETA_CORES = ['#3b82f6', '#f97316', '#a855f7', '#ef4444', '#eab308', '#06b6d4', '#ec4899', '#14b8a6'];

function corCaminhoneiro(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA_CORES[h % PALETA_CORES.length];
}

const SVG_CAMINHAO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm.5 1.5 1.96 2.5H17V9.5h3.5zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>`;

function criarIconeCaminhao(cor: string, ativo: boolean): L.DivIcon {
  const fundo = ativo ? cor : '#6b7280';
  const opacidade = ativo ? '1' : '0.65';
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${fundo};border-radius:50%;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;opacity:${opacidade};">${SVG_CAMINHAO}</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  });
}

function criarIconeDestino(cor: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${cor};border-radius:4px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:15px;">&#127937;</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface MenuContexto {
  x: number;
  y: number;
  caminhoneiro: CaminhoneiroComLocalizacao;
  mostrarInput: boolean;
}

const estilosMenu: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    zIndex: 9999,
    backgroundColor: '#16213e',
    border: '1px solid #0f3460',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    minWidth: 220,
    overflow: 'hidden',
  },
  header: {
    padding: '8px 12px',
    borderBottom: '1px solid #0f3460',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerNome: { fontWeight: 600, fontSize: 13, color: '#ffffff' },
  secaoDestino: { padding: '10px 12px' },
  label: { fontSize: 11, color: '#8888aa', marginBottom: 6 },
  input: {
    width: '100%',
    padding: '6px 8px',
    borderRadius: 4,
    border: '1px solid #0f3460',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box',
  },
  erroTexto: { fontSize: 11, color: '#ef4444', marginTop: 4 },
  botaoItem: {
    width: '100%',
    padding: '9px 12px',
    border: 'none',
    borderTop: '1px solid #0f3460',
    backgroundColor: 'transparent',
    color: '#ccccdd',
    fontSize: 12,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  linkMaps: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 12px',
    borderTop: '1px solid #0f3460',
    color: '#8888aa',
    fontSize: 12,
    textDecoration: 'none',
  },
};

export function MapaCaminhoneiros({ caminhoneiros, onSelecionar }: MapaCaminhoneirosProps) {
  const {
    caminhoneirosComPosicao,
    centroInicial,
    destinosPorId,
    rotasPorId,
    geocodificando,
    atribuirDestino,
    removerDestino,
  } = useMapaCaminhoneiros(caminhoneiros);

  const [menu, setMenu] = useState<MenuContexto | null>(null);
  const [inputDestino, setInputDestino] = useState('');
  const [erroDestino, setErroDestino] = useState('');

  useEffect(() => {
    if (!menu) return;
    function fecharFora(e: MouseEvent) {
      const el = document.getElementById('mapa-menu-contexto');
      if (el && !el.contains(e.target as Node)) {
        setMenu(null);
        setInputDestino('');
        setErroDestino('');
      }
    }
    document.addEventListener('mousedown', fecharFora);
    return () => document.removeEventListener('mousedown', fecharFora);
  }, [menu]);

  const abrirMenu = useCallback((e: L.LeafletMouseEvent, caminhoneiro: CaminhoneiroComLocalizacao) => {
    e.originalEvent.preventDefault();
    setMenu({ x: e.originalEvent.clientX, y: e.originalEvent.clientY, caminhoneiro, mostrarInput: false });
    setInputDestino('');
    setErroDestino('');
  }, []);

  const confirmarDestino = useCallback(async () => {
    if (!menu || !inputDestino.trim()) return;
    const { caminhoneiro } = menu;
    if (!caminhoneiro.ultima_latitude || !caminhoneiro.ultima_longitude) return;
    const ok = await atribuirDestino(
      caminhoneiro.id,
      caminhoneiro.ultima_latitude,
      caminhoneiro.ultima_longitude,
      inputDestino
    );
    if (!ok) {
      setErroDestino('Endereço não encontrado. Tente ser mais específico.');
    } else {
      setMenu(null);
      setInputDestino('');
    }
  }, [menu, inputDestino, atribuirDestino]);

  return (
    <>
      <MapContainer
        center={centroInicial}
        zoom={5}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.entries(rotasPorId).map(([id, coords]) => (
          <Polyline
            key={`rota-${id}`}
            positions={coords}
            pathOptions={{ color: corCaminhoneiro(id), weight: 4, opacity: 0.75, dashArray: '10, 6' }}
          />
        ))}

        {Object.entries(destinosPorId).map(([id, destino]) => (
          <Marker key={`dest-${id}`} position={destino.coords} icon={criarIconeDestino(corCaminhoneiro(id))}>
            <Tooltip permanent direction="top" offset={[0, -16]}>
              {destino.nome}
            </Tooltip>
          </Marker>
        ))}

        {caminhoneirosComPosicao.map((caminhoneiro) => {
          const cor = corCaminhoneiro(caminhoneiro.id);
          return (
            <Marker
              key={caminhoneiro.id}
              position={[caminhoneiro.ultima_latitude!, caminhoneiro.ultima_longitude!]}
              icon={criarIconeCaminhao(cor, caminhoneiro.rastreando)}
              eventHandlers={{
                click: () => onSelecionar(caminhoneiro.id),
                contextmenu: (e) => abrirMenu(e as unknown as L.LeafletMouseEvent, caminhoneiro),
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -20]}>
                {caminhoneiro.nome.split(' ')[0]}
              </Tooltip>
              <Popup>
                <strong>{caminhoneiro.nome}</strong>
                <br />
                {caminhoneiro.rastreando ? '🟢 Rastreando' : '⚫ Offline'}
                {caminhoneiro.ultima_velocidade != null && (
                  <><br />{caminhoneiro.ultima_velocidade.toFixed(0)} km/h</>
                )}
                {caminhoneiro.ultima_atualizacao && (
                  <><br />{new Date(caminhoneiro.ultima_atualizacao).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</>
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {menu && (
        <div id="mapa-menu-contexto" style={{ ...estilosMenu.container, left: menu.x, top: menu.y }}>
          <div style={estilosMenu.header}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: corCaminhoneiro(menu.caminhoneiro.id), flexShrink: 0 }} />
            <span style={estilosMenu.headerNome}>{menu.caminhoneiro.nome}</span>
          </div>

          {!menu.mostrarInput ? (
            <>
              <button style={estilosMenu.botaoItem} onClick={() => setMenu((m) => m && { ...m, mostrarInput: true })}>
                📍 Atribuir Destino
              </button>

              {destinosPorId[menu.caminhoneiro.id] && (
                <button
                  style={{ ...estilosMenu.botaoItem, color: '#ef4444' }}
                  onClick={() => { removerDestino(menu.caminhoneiro.id); setMenu(null); }}
                >
                  🗑️ Remover Destino
                </button>
              )}

              {menu.caminhoneiro.ultima_latitude && (
                <a
                  href={`https://www.google.com/maps?q=${menu.caminhoneiro.ultima_latitude},${menu.caminhoneiro.ultima_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={estilosMenu.linkMaps}
                  onClick={() => setMenu(null)}
                >
                  🗺️ Abrir no Google Maps
                </a>
              )}
            </>
          ) : (
            <div style={estilosMenu.secaoDestino}>
              <div style={estilosMenu.label}>Endereço de destino</div>
              <input
                autoFocus
                value={inputDestino}
                onChange={(e) => { setInputDestino(e.target.value); setErroDestino(''); }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') confirmarDestino();
                  if (e.key === 'Escape') setMenu(null);
                }}
                placeholder="Ex: Terminal Intermodal, Campinas, SP"
                style={estilosMenu.input}
              />
              {erroDestino && <div style={estilosMenu.erroTexto}>{erroDestino}</div>}
              <button
                onClick={confirmarDestino}
                disabled={geocodificando === menu.caminhoneiro.id || !inputDestino.trim()}
                style={{
                  marginTop: 8,
                  width: '100%',
                  padding: '7px 0',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: geocodificando ? '#0f3460' : corCaminhoneiro(menu.caminhoneiro.id),
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: geocodificando ? 'wait' : 'pointer',
                }}
              >
                {geocodificando === menu.caminhoneiro.id ? 'Buscando rota...' : 'Definir Rota'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
