from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.connection import obter_sessao
from app.infrastructure.repositories.caminhoneiro_repository_impl import CaminhoneiroRepository
from app.infrastructure.repositories.localizacao_repository_impl import LocacalizacaoRepository
from app.application.services.localizacao_service import LocalizacaoService
from app.domain.schemas.localizacao_schema import LocalizacaoCreate, LocalizacaoResponse
from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.exceptions import CaminhoneiroNaoEncontradoError
from app.interfaces.api.v1.dependencies.auth_dependency import obter_caminhoneiro_autenticado
from app.interfaces.api.v1.websocket.connection_manager import RastreamentoConnectionManager

router = APIRouter(prefix="/localizacoes", tags=["localizacoes"])


def obter_connection_manager(request: Request) -> RastreamentoConnectionManager:
    return request.app.state.connection_manager


@router.post("", response_model=LocalizacaoResponse, status_code=status.HTTP_201_CREATED)
async def registrar_localizacao(
    request: Request,
    dados: LocalizacaoCreate,
    caminhoneiro: Caminhoneiro = Depends(obter_caminhoneiro_autenticado),
    sessao: AsyncSession = Depends(obter_sessao),
    manager: RastreamentoConnectionManager = Depends(obter_connection_manager),
) -> LocalizacaoResponse:
    service = LocalizacaoService(
        localizacao_repository=LocacalizacaoRepository(sessao),
        caminhoneiro_repository=CaminhoneiroRepository(sessao),
    )

    try:
        localizacao = await service.registrar(caminhoneiro.id, dados)
    except CaminhoneiroNaoEncontradoError as erro:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(erro))

    await manager.broadcast_localizacao({
        "caminhoneiro_id": caminhoneiro.id,
        "nome": caminhoneiro.nome,
        "latitude": dados.latitude,
        "longitude": dados.longitude,
        "velocidade": dados.velocidade,
        "atualizado_em": localizacao.recebido_em.isoformat(),
    })

    return localizacao
