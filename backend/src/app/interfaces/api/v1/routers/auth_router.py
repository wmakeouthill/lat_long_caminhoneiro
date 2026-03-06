from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.connection import obter_sessao
from app.infrastructure.repositories.caminhoneiro_repository_impl import CaminhoneiroRepository
from app.application.services.auth_service import AuthService
from app.domain.schemas.auth_schema import GoogleTokenRequest
from app.domain.schemas.caminhoneiro_schema import CaminhoneiroResponse
from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.exceptions import TokenGoogleInvalidoError
from app.interfaces.api.v1.dependencies.auth_dependency import obter_caminhoneiro_autenticado
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])


class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    caminhoneiro: CaminhoneiroResponse


@router.post("/google", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def autenticar_com_google(
    request: Request,
    payload: GoogleTokenRequest,
    sessao: AsyncSession = Depends(obter_sessao),
) -> AuthResponse:
    settings = request.app.state.settings
    repositorio = CaminhoneiroRepository(sessao)
    service = AuthService(
        caminhoneiro_repository=repositorio,
        google_client_ids=settings.google_client_ids_validos,
        jwt_secret_key=settings.jwt_secret_key,
    )

    try:
        token_response, caminhoneiro_response = await service.autenticar_com_google(
            payload.id_token
        )
    except TokenGoogleInvalidoError as erro:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(erro),
        )

    return AuthResponse(
        access_token=token_response.access_token,
        token_type=token_response.token_type,
        caminhoneiro=caminhoneiro_response,
    )


@router.get("/me", response_model=CaminhoneiroResponse)
async def obter_perfil(
    caminhoneiro: Caminhoneiro = Depends(obter_caminhoneiro_autenticado),
) -> CaminhoneiroResponse:
    return CaminhoneiroResponse.model_validate(caminhoneiro)
