from app.domain.repositories.caminhoneiro_repository import ICaminhoneiroRepository
from app.domain.schemas.caminhoneiro_schema import (
    CaminhoneiroResponse,
    CaminhoneiroComLocalizacaoResponse,
)
from app.domain.exceptions import CaminhoneiroNaoEncontradoError


class CaminhoneiroService:

    def __init__(self, caminhoneiro_repository: ICaminhoneiroRepository) -> None:
        self._caminhoneiro_repository = caminhoneiro_repository

    async def buscar_por_id(self, caminhoneiro_id: str) -> CaminhoneiroResponse:
        caminhoneiro = await self._caminhoneiro_repository.buscar_por_id(caminhoneiro_id)
        if caminhoneiro is None:
            raise CaminhoneiroNaoEncontradoError(
                f"Caminhoneiro {caminhoneiro_id} não encontrado"
            )
        return CaminhoneiroResponse.model_validate(caminhoneiro)

    async def listar_todos_com_localizacao(
        self,
    ) -> list[CaminhoneiroComLocalizacaoResponse]:
        return await self._caminhoneiro_repository.listar_com_ultima_localizacao()
