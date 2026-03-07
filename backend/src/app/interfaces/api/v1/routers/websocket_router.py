from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/rastreamento")
async def websocket_rastreamento(websocket: WebSocket) -> None:
    manager = websocket.app.state.connection_manager
    await manager.conectar(websocket)

    try:
        while True:
            # mantém a conexão viva aguardando ping do cliente
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.desconectar(websocket)
