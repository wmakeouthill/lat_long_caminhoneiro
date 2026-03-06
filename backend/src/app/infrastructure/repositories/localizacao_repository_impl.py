from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.entities.localizacao import Localizacao
from app.domain.repositories.localizacao_repository import ILocalizacaoRepository
from app.domain.schemas.localizacao_schema import LocalizacaoHistoricoResponse


class LocacalizacaoRepository(ILocalizacaoRepository):

    def __init__(self, sessao: AsyncSession) -> None:
        self._sessao = sessao

    async def salvar(self, localizacao: Localizacao) -> Localizacao:
        self._sessao.add(localizacao)
        await self._sessao.commit()
        await self._sessao.refresh(localizacao)
        return localizacao

    async def listar_historico(
        self, caminhoneiro_id: str, limite: int = 100
    ) -> list[LocalizacaoHistoricoResponse]:
        resultado = await self._sessao.execute(
            select(Localizacao)
            .where(Localizacao.caminhoneiro_id == caminhoneiro_id)
            .order_by(Localizacao.registrado_em.desc())
            .limit(limite)
        )
        localizacoes = resultado.scalars().all()
        return [LocalizacaoHistoricoResponse.model_validate(loc) for loc in localizacoes]
