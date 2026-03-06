from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.config.settings import carregar_settings
from app.infrastructure.database.connection import inicializar_banco, obter_engine, Base
from app.interfaces.api.v1.routers import auth_router, localizacoes_router, caminhoneiros_router, websocket_router
from app.interfaces.api.v1.websocket.connection_manager import RastreamentoConnectionManager

# importa entidades para o Alembic e criação de tabelas detectarem os models
from app.domain.entities import caminhoneiro, localizacao  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = carregar_settings()
    inicializar_banco(settings.database_url)

    async with obter_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.state.settings = settings
    app.state.connection_manager = RastreamentoConnectionManager()

    yield


def criar_app() -> FastAPI:
    app = FastAPI(
        title="Lat/Long Caminhoneiro",
        description="API de rastreamento GPS para caminhoneiros",
        version="1.0.0",
        lifespan=lifespan,
    )

    settings = carregar_settings()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = "/api/v1"
    app.include_router(auth_router.router, prefix=api_prefix)
    app.include_router(localizacoes_router.router, prefix=api_prefix)
    app.include_router(caminhoneiros_router.router, prefix=api_prefix)
    app.include_router(websocket_router.router)

    @app.get("/health")
    async def health_check() -> dict:
        return {"status": "ok"}

    return app


app = criar_app()
