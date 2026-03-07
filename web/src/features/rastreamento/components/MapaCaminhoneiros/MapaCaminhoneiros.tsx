import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { useMapaCaminhoneiros } from './MapaCaminhoneiros.hooks';
import type { MapaCaminhoneirosProps } from './MapaCaminhoneiros.types';

function criarIconeCaminhao(ativo: boolean): L.DivIcon {
  const cor = ativo ? '#22c55e' : '#6b7280';
  return L.divIcon({
    html: `<div style="
      display:flex;
      align-items:center;
      justify-content:center;
      width:36px;
      height:36px;
      background:${cor};
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      font-size:20px;
      line-height:1;
    ">🚚</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

export function MapaCaminhoneiros({ caminhoneiros, onSelecionar }: MapaCaminhoneirosProps) {
  const { caminhoneirosComPosicao, centroInicial } = useMapaCaminhoneiros(caminhoneiros);

  return (
    <MapContainer
      center={centroInicial}
      zoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {caminhoneirosComPosicao.map((caminhoneiro) => (
        <Marker
          key={caminhoneiro.id}
          position={[caminhoneiro.ultima_latitude!, caminhoneiro.ultima_longitude!]}
          icon={criarIconeCaminhao(caminhoneiro.rastreando)}
          eventHandlers={{ click: () => onSelecionar(caminhoneiro.id) }}
        >
          <Tooltip permanent direction="top" offset={[0, -42]}>
            {caminhoneiro.nome.split(' ')[0]}
          </Tooltip>
          <Popup>
            <strong>{caminhoneiro.nome}</strong>
            <br />
            {caminhoneiro.rastreando ? '🟢 Rastreando' : '⚫ Offline'}
            {caminhoneiro.ultima_velocidade && (
              <>
                <br />
                {caminhoneiro.ultima_velocidade.toFixed(0)} km/h
              </>
            )}
            {caminhoneiro.ultima_atualizacao && (
              <>
                <br />
                {new Date(caminhoneiro.ultima_atualizacao).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
