export interface CaminhoneiroComLocalizacao {
  id: string;
  nome: string;
  email: string;
  foto_url: string | null;
  rastreando: boolean;
  ultima_latitude: number | null;
  ultima_longitude: number | null;
  ultima_velocidade: number | null;
  ultima_atualizacao: string | null;
}

export interface AtualizacaoLocalizacaoWs {
  caminhoneiro_id: string;
  nome: string;
  rastreando: boolean;
  latitude: number | null;
  longitude: number | null;
  velocidade: number | null;
  atualizado_em: string;
}
