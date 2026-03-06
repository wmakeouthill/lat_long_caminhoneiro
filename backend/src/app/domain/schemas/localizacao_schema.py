from pydantic import BaseModel, field_validator
from datetime import datetime


class LocalizacaoCreate(BaseModel):
    latitude: float
    longitude: float
    precisao: float | None = None
    velocidade: float | None = None
    registrado_em: datetime

    @field_validator("latitude")
    @classmethod
    def validar_latitude(cls, valor: float) -> float:
        if not (-90 <= valor <= 90):
            raise ValueError("Latitude deve estar entre -90 e 90")
        return valor

    @field_validator("longitude")
    @classmethod
    def validar_longitude(cls, valor: float) -> float:
        if not (-180 <= valor <= 180):
            raise ValueError("Longitude deve estar entre -180 e 180")
        return valor


class LocalizacaoResponse(BaseModel):
    id: str
    recebido_em: datetime

    model_config = {"from_attributes": True}


class LocalizacaoHistoricoResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    precisao: float | None
    velocidade: float | None
    registrado_em: datetime
    recebido_em: datetime

    model_config = {"from_attributes": True}
