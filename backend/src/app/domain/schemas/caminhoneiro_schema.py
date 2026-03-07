from pydantic import BaseModel, field_validator
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


class NomeUpdate(BaseModel):
    nome: str

    @field_validator("nome")
    @classmethod
    def validar_nome(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Nome não pode ser vazio")
        if len(v) > 255:
            raise ValueError("Nome muito longo")
        return v
