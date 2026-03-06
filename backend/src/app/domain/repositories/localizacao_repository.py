from abc import ABC, abstractmethod
from app.domain.entities.localizacao import Localizacao
from app.domain.schemas.localizacao_schema import LocalizacaoHistoricoResponse


class ILocalizacaoRepository(ABC):

    @abstractmethod
    async def salvar(self, localizacao: Localizacao) -> Localizacao:
        pass

    @abstractmethod
    async def listar_historico(
        self, caminhoneiro_id: str, limite: int = 100
    ) -> list[LocalizacaoHistoricoResponse]:
        pass
