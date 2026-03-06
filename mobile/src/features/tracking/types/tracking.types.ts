export interface PayloadLocalizacao {
  latitude: number;
  longitude: number;
  precisao: number | null;
  velocidade: number | null;
  registrado_em: string;
}

export interface StatusRastreamento {
  ativo: boolean;
  ultimaAtualizacao: Date | null;
  ultimaLatitude: number | null;
  ultimaLongitude: number | null;
}
