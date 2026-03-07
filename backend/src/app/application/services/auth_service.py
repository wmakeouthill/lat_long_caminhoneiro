from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.repositories.caminhoneiro_repository import ICaminhoneiroRepository
from app.domain.schemas.auth_schema import GoogleUserInfo, TokenResponse
from app.domain.schemas.caminhoneiro_schema import CaminhoneiroResponse
from app.infrastructure.security.google_oauth import verificar_id_token_google
from app.infrastructure.security.jwt_handler import criar_access_token


class AuthService:

    def __init__(
        self,
        caminhoneiro_repository: ICaminhoneiroRepository,
        google_client_ids: list[str],
        jwt_secret_key: str,
    ) -> None:
        self._caminhoneiro_repository = caminhoneiro_repository
        self._google_client_ids = google_client_ids
        self._jwt_secret_key = jwt_secret_key

    async def autenticar_com_google(self, id_token: str) -> tuple[TokenResponse, CaminhoneiroResponse]:
        info_google: GoogleUserInfo = await verificar_id_token_google(
            id_token, self._google_client_ids
        )

        caminhoneiro = await self._caminhoneiro_repository.buscar_por_google_sub(
            info_google.sub
        )

        if caminhoneiro is None:
            caminhoneiro = Caminhoneiro(
                google_sub=info_google.sub,
                nome=info_google.nome,
                email=info_google.email,
                foto_url=info_google.foto_url,
            )
            caminhoneiro = await self._caminhoneiro_repository.salvar(caminhoneiro)
        else:
            # Preserva nome customizado — só atualiza a foto de perfil
            caminhoneiro.foto_url = info_google.foto_url
            caminhoneiro = await self._caminhoneiro_repository.salvar(caminhoneiro)

        token = TokenResponse(
            access_token=criar_access_token(caminhoneiro.id, self._jwt_secret_key)
        )
        dados_caminhoneiro = CaminhoneiroResponse.model_validate(caminhoneiro)

        return token, dados_caminhoneiro
