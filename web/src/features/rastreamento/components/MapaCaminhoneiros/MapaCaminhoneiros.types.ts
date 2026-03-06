import type { CaminhoneiroComLocalizacao } from '../../types/rastreamento.types';

export interface MapaCaminhoneirosProps {
  caminhoneiros: CaminhoneiroComLocalizacao[];
  caminhoneiroSelecionadoId: string | null;
  onSelecionar: (id: string) => void;
}
