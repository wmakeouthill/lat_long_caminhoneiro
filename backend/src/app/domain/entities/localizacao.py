import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.database.connection import Base


class Localizacao(Base):
    __tablename__ = "localizacoes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    caminhoneiro_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("caminhoneiros.id"), nullable=False, index=True
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    precisao: Mapped[float | None] = mapped_column(Float, nullable=True)
    velocidade: Mapped[float | None] = mapped_column(Float, nullable=True)
    registrado_em: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    recebido_em: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    caminhoneiro: Mapped["Caminhoneiro"] = relationship(  # noqa: F821
        "Caminhoneiro", back_populates="localizacoes"
    )
