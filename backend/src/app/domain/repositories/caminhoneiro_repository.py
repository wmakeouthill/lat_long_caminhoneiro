from abc import ABC, abstractmethod
from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.schemas.caminhoneiro_schema import CaminhoneiroComLocalizacaoResponse


class ICaminhoneiroRepository(ABC):

    @abstractmethod
    async def buscar_por_google_sub(self, google_sub: str) -> Caminhoneiro | None:
        pass

    @abstractmethod
    async def buscar_por_id(self, caminhoneiro_id: str) -> Caminhoneiro | None:
        pass

    @abstractmethod
    async def salvar(self, caminhoneiro: Caminhoneiro) -> Caminhoneiro:
        pass

    @abstractmethod
    async def listar_com_ultima_localizacao(
        self,
    ) -> list[CaminhoneiroComLocalizacaoResponse]:
        pass

    @abstractmethod
    async def atualizar_status_rastreamento(
        self, caminhoneiro_id: str, rastreando: bool
    ) -> None:
        pass

    @abstractmethod
    async def atualizar_nome(self, caminhoneiro_id: str, nome: str) -> None:
        pass
