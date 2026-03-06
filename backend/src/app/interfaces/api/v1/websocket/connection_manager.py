from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class RastreamentoConnectionManager:

    def __init__(self) -> None:
        self._conexoes: list[WebSocket] = []

    async def conectar(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._conexoes.append(websocket)
        logger.info("Dashboard conectado. Total: %d", len(self._conexoes))

    def desconectar(self, websocket: WebSocket) -> None:
        if websocket in self._conexoes:
            self._conexoes.remove(websocket)
        logger.info("Dashboard desconectado. Total: %d", len(self._conexoes))

    async def broadcast_localizacao(self, dados: dict) -> None:
        conexoes_mortas: list[WebSocket] = []

        for conexao in self._conexoes:
            try:
                await conexao.send_json(dados)
            except Exception:
                conexoes_mortas.append(conexao)

        for conexao in conexoes_mortas:
            self.desconectar(conexao)
