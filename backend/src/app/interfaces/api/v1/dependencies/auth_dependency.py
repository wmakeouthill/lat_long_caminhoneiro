from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.connection import obter_sessao
from app.infrastructure.security.jwt_handler import decodificar_access_token
from app.infrastructure.repositories.caminhoneiro_repository_impl import CaminhoneiroRepository
from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.exceptions import TokenJwtInvalidoError

_bearer_scheme = HTTPBearer()


async def obter_caminhoneiro_autenticado(
    request: Request,
    credenciais: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    sessao: AsyncSession = Depends(obter_sessao),
) -> Caminhoneiro:
    settings = request.app.state.settings

    try:
        caminhoneiro_id = decodificar_access_token(
            credenciais.credentials, settings.jwt_secret_key
        )
    except TokenJwtInvalidoError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )

    repositorio = CaminhoneiroRepository(sessao)
    caminhoneiro = await repositorio.buscar_por_id(caminhoneiro_id)

    if caminhoneiro is None or not caminhoneiro.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Caminhoneiro não encontrado ou inativo",
        )

    return caminhoneiro
