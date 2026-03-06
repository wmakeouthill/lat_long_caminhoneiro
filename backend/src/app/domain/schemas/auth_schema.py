from pydantic import BaseModel


class GoogleTokenRequest(BaseModel):
    id_token: str


class GoogleUserInfo(BaseModel):
    sub: str
    email: str
    nome: str
    foto_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
