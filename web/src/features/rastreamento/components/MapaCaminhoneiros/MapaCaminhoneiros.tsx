import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapaCaminhoneiros } from './MapaCaminhoneiros.hooks';
import type { MapaCaminhoneirosProps } from './MapaCaminhoneiros.types';

// Corrige ícone padrão do Leaflet em bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const iconeAtivo = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconeInativo = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

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
          icon={caminhoneiro.rastreando ? iconeAtivo : iconeInativo}
          eventHandlers={{ click: () => onSelecionar(caminhoneiro.id) }}
        >
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
                {new Date(caminhoneiro.ultima_atualizacao).toLocaleTimeString('pt-BR')}
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
