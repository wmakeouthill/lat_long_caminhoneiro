from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.connection import obter_sessao
from app.infrastructure.repositories.caminhoneiro_repository_impl import CaminhoneiroRepository
from app.infrastructure.repositories.localizacao_repository_impl import LocacalizacaoRepository
from app.application.services.caminhoneiro_service import CaminhoneiroService
from app.application.services.localizacao_service import LocalizacaoService
from app.domain.schemas.caminhoneiro_schema import CaminhoneiroComLocalizacaoResponse
from app.domain.schemas.localizacao_schema import LocalizacaoHistoricoResponse
from app.domain.exceptions import CaminhoneiroNaoEncontradoError

router = APIRouter(prefix="/caminhoneiros", tags=["caminhoneiros"])


@router.get("", response_model=list[CaminhoneiroComLocalizacaoResponse])
async def listar_caminhoneiros(
    sessao: AsyncSession = Depends(obter_sessao),
) -> list[CaminhoneiroComLocalizacaoResponse]:
    service = CaminhoneiroService(CaminhoneiroRepository(sessao))
    return await service.listar_todos_com_localizacao()


@router.get(
    "/{caminhoneiro_id}/historico",
    response_model=list[LocalizacaoHistoricoResponse],
)
async def listar_historico(
    caminhoneiro_id: str,
    limite: int = 100,
    sessao: AsyncSession = Depends(obter_sessao),
) -> list[LocalizacaoHistoricoResponse]:
    service = LocalizacaoService(
        localizacao_repository=LocacalizacaoRepository(sessao),
        caminhoneiro_repository=CaminhoneiroRepository(sessao),
    )

    try:
        return await service.listar_historico(caminhoneiro_id, limite)
    except CaminhoneiroNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))
