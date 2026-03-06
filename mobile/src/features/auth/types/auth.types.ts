export interface CaminhoneiroAuth {
  id: string;
  nome: string;
  email: string;
  foto_url: string | null;
  ativo: boolean;
  rastreando: boolean;
  criado_em: string;
}

export interface AuthApiResponse {
  access_token: string;
  token_type: string;
  caminhoneiro: CaminhoneiroAuth;
}
