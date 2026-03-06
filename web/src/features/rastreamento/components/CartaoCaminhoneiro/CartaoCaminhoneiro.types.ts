import type { CaminhoneiroComLocalizacao } from '../../types/rastreamento.types';

export interface CartaoCaminhoneiroProps {
  caminhoneiro: CaminhoneiroComLocalizacao;
  selecionado: boolean;
  onClick: () => void;
}
