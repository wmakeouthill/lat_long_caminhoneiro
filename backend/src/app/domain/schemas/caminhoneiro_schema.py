from pydantic import BaseModel
from datetime import datetime


class CaminhoneiroResponse(BaseModel):
    id: str
    nome: str
    email: str
    foto_url: str | None
    ativo: bool
    rastreando: bool
    criado_em: datetime

    model_config = {"from_attributes": True}


class CaminhoneiroComLocalizacaoResponse(BaseModel):
    id: str
    nome: str
    email: str
    foto_url: str | None
    rastreando: bool
    ultima_latitude: float | None = None
    ultima_longitude: float | None = None
    ultima_velocidade: float | None = None
    ultima_atualizacao: datetime | None = None
