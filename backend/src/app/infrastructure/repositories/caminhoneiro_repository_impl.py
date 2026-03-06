from datetime import datetime
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.entities.caminhoneiro import Caminhoneiro
from app.domain.entities.localizacao import Localizacao
from app.domain.repositories.caminhoneiro_repository import ICaminhoneiroRepository
from app.domain.schemas.caminhoneiro_schema import CaminhoneiroComLocalizacaoResponse


class CaminhoneiroRepository(ICaminhoneiroRepository):

    def __init__(self, sessao: AsyncSession) -> None:
        self._sessao = sessao

    async def buscar_por_google_sub(self, google_sub: str) -> Caminhoneiro | None:
        resultado = await self._sessao.execute(
            select(Caminhoneiro).where(Caminhoneiro.google_sub == google_sub)
        )
        return resultado.scalar_one_or_none()

    async def buscar_por_id(self, caminhoneiro_id: str) -> Caminhoneiro | None:
        resultado = await self._sessao.execute(
            select(Caminhoneiro).where(Caminhoneiro.id == caminhoneiro_id)
        )
        return resultado.scalar_one_or_none()

    async def salvar(self, caminhoneiro: Caminhoneiro) -> Caminhoneiro:
        self._sessao.add(caminhoneiro)
        await self._sessao.commit()
        await self._sessao.refresh(caminhoneiro)
        return caminhoneiro

    async def listar_com_ultima_localizacao(
        self,
    ) -> list[CaminhoneiroComLocalizacaoResponse]:
        resultado = await self._sessao.execute(select(Caminhoneiro))
        caminhoneiros = resultado.scalars().all()

        resposta: list[CaminhoneiroComLocalizacaoResponse] = []
        for caminhoneiro in caminhoneiros:
            ultima = await self._sessao.execute(
                select(Localizacao)
                .where(Localizacao.caminhoneiro_id == caminhoneiro.id)
                .order_by(Localizacao.registrado_em.desc())
                .limit(1)
            )
            localizacao = ultima.scalar_one_or_none()

            resposta.append(
                CaminhoneiroComLocalizacaoResponse(
                    id=caminhoneiro.id,
                    nome=caminhoneiro.nome,
                    email=caminhoneiro.email,
                    foto_url=caminhoneiro.foto_url,
                    rastreando=caminhoneiro.rastreando,
                    ultima_latitude=localizacao.latitude if localizacao else None,
                    ultima_longitude=localizacao.longitude if localizacao else None,
                    ultima_velocidade=localizacao.velocidade if localizacao else None,
                    ultima_atualizacao=localizacao.recebido_em if localizacao else None,
                )
            )

        return resposta

    async def atualizar_status_rastreamento(
        self, caminhoneiro_id: str, rastreando: bool
    ) -> None:
        await self._sessao.execute(
            update(Caminhoneiro)
            .where(Caminhoneiro.id == caminhoneiro_id)
            .values(rastreando=rastreando, atualizado_em=datetime.utcnow())
        )
        await self._sessao.commit()
