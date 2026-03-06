from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator


class Base(DeclarativeBase):
    pass


_engine = None
_session_factory = None


def inicializar_banco(database_url: str) -> None:
    global _engine, _session_factory

    connect_args = {"check_same_thread": False} if "sqlite" in database_url else {}

    _engine = create_async_engine(
        database_url,
        echo=False,
        connect_args=connect_args,
    )
    _session_factory = async_sessionmaker(
        bind=_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )


def obter_engine():
    if _engine is None:
        raise RuntimeError("Banco de dados não inicializado. Chame inicializar_banco() primeiro.")
    return _engine


async def obter_sessao() -> AsyncGenerator[AsyncSession, None]:
    if _session_factory is None:
        raise RuntimeError("Banco de dados não inicializado. Chame inicializar_banco() primeiro.")
    async with _session_factory() as sessao:
        yield sessao
