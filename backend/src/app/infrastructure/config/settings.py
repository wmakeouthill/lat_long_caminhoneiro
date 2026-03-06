from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    jwt_secret_key: str
    google_client_id: str
    google_android_client_id: str = ""
    database_url: str = "sqlite+aiosqlite:///./data/rastreamento.db"
    cors_origins: list[str] = ["http://localhost:5173"]
    intervalo_rastreamento_segundos: int = 60

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, valor: str | list[str]) -> list[str]:
        if isinstance(valor, str):
            return json.loads(valor)
        return valor

    @property
    def google_client_ids_validos(self) -> list[str]:
        ids = [self.google_client_id]
        if self.google_android_client_id:
            ids.append(self.google_android_client_id)
        return ids


def carregar_settings() -> Settings:
    return Settings()
