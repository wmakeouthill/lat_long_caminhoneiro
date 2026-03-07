import { useMemo, useState, useCallback } from 'react';
import type { CaminhoneiroComLocalizacao } from '../../types/rastreamento.types';

export interface Destino {
  nome: string;
  coords: [number, number];
}

export function useMapaCaminhoneiros(caminhoneiros: CaminhoneiroComLocalizacao[]) {
  const [destinosPorId, setDestinosPorId] = useState<Record<string, Destino>>({});
  const [rotasPorId, setRotasPorId] = useState<Record<string, [number, number][]>>({});
  const [geocodificando, setGeocodificando] = useState<string | null>(null);

  const caminhoneirosComPosicao = useMemo(
    () => caminhoneiros.filter((c) => c.ultima_latitude !== null && c.ultima_longitude !== null),
    [caminhoneiros]
  );

  const centroInicial = useMemo((): [number, number] => {
    if (caminhoneirosComPosicao.length === 0) return [-15.7801, -47.9292];
    const primeiro = caminhoneirosComPosicao[0];
    return [primeiro.ultima_latitude!, primeiro.ultima_longitude!];
  }, [caminhoneirosComPosicao]);

  const atribuirDestino = useCallback(
    async (
      caminhoneiroId: string,
      origemLat: number,
      origemLon: number,
      enderecoDestino: string
    ): Promise<boolean> => {
      setGeocodificando(caminhoneiroId);
      try {
        const geoResp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoDestino)}&limit=1&countrycodes=br`,
          { headers: { 'Accept-Language': 'pt-BR' } }
        );
        const geoData = await geoResp.json();
        if (!geoData.length) return false;

        const destLat = parseFloat(geoData[0].lat);
        const destLon = parseFloat(geoData[0].lon);
        const nomeDestino = geoData[0].display_name.split(',')[0];

        setDestinosPorId((prev) => ({
          ...prev,
          [caminhoneiroId]: { nome: nomeDestino, coords: [destLat, destLon] },
        }));

        const osrmResp = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${origemLon},${origemLat};${destLon},${destLat}?overview=full&geometries=geojson`
        );
        const osrmData = await osrmResp.json();
        if (osrmData.routes?.length) {
          const coords: [number, number][] = osrmData.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
          );
          setRotasPorId((prev) => ({ ...prev, [caminhoneiroId]: coords }));
        }

        return true;
      } catch {
        return false;
      } finally {
        setGeocodificando(null);
      }
    },
    []
  );

  const removerDestino = useCallback((caminhoneiroId: string) => {
    setDestinosPorId((prev) => {
      const next = { ...prev };
      delete next[caminhoneiroId];
      return next;
    });
    setRotasPorId((prev) => {
      const next = { ...prev };
      delete next[caminhoneiroId];
      return next;
    });
  }, []);

  return {
    caminhoneirosComPosicao,
    centroInicial,
    destinosPorId,
    rotasPorId,
    geocodificando,
    atribuirDestino,
    removerDestino,
  };
}
