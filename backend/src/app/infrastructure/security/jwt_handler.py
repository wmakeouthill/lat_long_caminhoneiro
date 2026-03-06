from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.domain.exceptions import TokenJwtInvalidoError

_ALGORITMO = "HS256"
_EXPIRACAO_DIAS = 90  # longa duração para app mobile daemon


def criar_access_token(subject: str, secret_key: str) -> str:
    expiracao = datetime.utcnow() + timedelta(days=_EXPIRACAO_DIAS)
    payload = {"sub": subject, "exp": expiracao}
    return jwt.encode(payload, secret_key, algorithm=_ALGORITMO)


def decodificar_access_token(token: str, secret_key: str) -> str:
    try:
        payload = jwt.decode(token, secret_key, algorithms=[_ALGORITMO])
        subject: str | None = payload.get("sub")
        if subject is None:
            raise TokenJwtInvalidoError("Token sem subject")
        return subject
    except JWTError as erro:
        raise TokenJwtInvalidoError(f"Token inválido: {erro}") from erro
