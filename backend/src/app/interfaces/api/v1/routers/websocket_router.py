from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/rastreamento")
async def websocket_rastreamento(websocket: WebSocket, request: Request) -> None:
    manager = request.app.state.connection_manager
    await manager.conectar(websocket)

    try:
        while True:
            # mantém a conexão viva aguardando ping do cliente
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.desconectar(websocket)
