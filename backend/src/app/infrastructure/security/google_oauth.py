import httpx
from app.domain.schemas.auth_schema import GoogleUserInfo
from app.domain.exceptions import TokenGoogleInvalidoError


async def verificar_id_token_google(
    id_token: str, client_ids_validos: list[str]
) -> GoogleUserInfo:
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )

    if response.status_code != 200:
        raise TokenGoogleInvalidoError("Token Google inválido ou expirado")

    dados = response.json()

    if dados.get("aud") not in client_ids_validos:
        raise TokenGoogleInvalidoError("Token Google com audience inválida")

    if "sub" not in dados or "email" not in dados:
        raise TokenGoogleInvalidoError("Token Google sem campos obrigatórios")

    return GoogleUserInfo(
        sub=dados["sub"],
        email=dados["email"],
        nome=dados.get("name", dados["email"]),
        foto_url=dados.get("picture"),
    )
