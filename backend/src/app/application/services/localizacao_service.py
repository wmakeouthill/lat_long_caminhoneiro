from datetime import datetime
from app.domain.entities.localizacao import Localizacao
from app.domain.repositories.localizacao_repository import ILocalizacaoRepository
from app.domain.repositories.caminhoneiro_repository import ICaminhoneiroRepository
from app.domain.schemas.localizacao_schema import (
    LocalizacaoCreate,
    LocalizacaoResponse,
    LocalizacaoHistoricoResponse,
)
from app.domain.exceptions import CaminhoneiroNaoEncontradoError


class LocalizacaoService:

    def __init__(
        self,
        localizacao_repository: ILocalizacaoRepository,
        caminhoneiro_repository: ICaminhoneiroRepository,
    ) -> None:
        self._localizacao_repository = localizacao_repository
        self._caminhoneiro_repository = caminhoneiro_repository

    async def registrar(
        self, caminhoneiro_id: str, dados: LocalizacaoCreate
    ) -> LocalizacaoResponse:
        caminhoneiro = await self._caminhoneiro_repository.buscar_por_id(caminhoneiro_id)
        if caminhoneiro is None:
            raise CaminhoneiroNaoEncontradoError(
                f"Caminhoneiro {caminhoneiro_id} não encontrado"
            )

        localizacao = Localizacao(
            caminhoneiro_id=caminhoneiro_id,
            latitude=dados.latitude,
            longitude=dados.longitude,
            precisao=dados.precisao,
            velocidade=dados.velocidade,
            registrado_em=dados.registrado_em,
            recebido_em=datetime.utcnow(),
        )

        await self._caminhoneiro_repository.atualizar_status_rastreamento(
            caminhoneiro_id, rastreando=True
        )

        localizacao = await self._localizacao_repository.salvar(localizacao)
        return LocalizacaoResponse.model_validate(localizacao)

    async def listar_historico(
        self, caminhoneiro_id: str, limite: int = 100
    ) -> list[LocalizacaoHistoricoResponse]:
        caminhoneiro = await self._caminhoneiro_repository.buscar_por_id(caminhoneiro_id)
        if caminhoneiro is None:
            raise CaminhoneiroNaoEncontradoError(
                f"Caminhoneiro {caminhoneiro_id} não encontrado"
            )
        return await self._localizacao_repository.listar_historico(caminhoneiro_id, limite)
