import asyncio
import websockets
import json

WEBSOCKET_HOST = 'localhost'
WEBSOCKET_PORT = 8765

CONNECTED_CLIENTS = set()
WS_EVENT_LOOP = None

async def register_client(websocket):
    CONNECTED_CLIENTS.add(websocket)
    print(f"[WebSocket] Client connected: {websocket.remote_address}. Total clients: {len(CONNECTED_CLIENTS)}")
    try:
        await websocket.wait_closed()
    except websockets.exceptions.ConnectionClosed:
        print(f"[WebSocket] Client connection closed: {websocket.remote_address}")
    finally:
        CONNECTED_CLIENTS.remove(websocket)
        print(f"[WebSocket] Client disconnected: {websocket.remote_address}. Total clients: {len(CONNECTED_CLIENTS)}")

async def broadcast_message_to_clients(message_payload_json: str):
    if not CONNECTED_CLIENTS:
        return
        
    tasks = [client.send(message_payload_json) for client in CONNECTED_CLIENTS]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for client, result in zip(list(CONNECTED_CLIENTS), results):
        if isinstance(result, Exception):
            print(f"[WebSocket] Error sending message to {client.remote_address}: {result}")

async def websocket_server_main_loop():
    global WS_EVENT_LOOP
    WS_EVENT_LOOP = asyncio.get_running_loop()
    print(f"[WebSocket] Starting server on ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")
    async with websockets.serve(register_client, WEBSOCKET_HOST, WEBSOCKET_PORT):
        await asyncio.Future()

def run_server_in_thread():
    try:
        asyncio.run(websocket_server_main_loop())
    except KeyboardInterrupt:
        print("[WebSocket] Server shutting down...")
    except Exception as e:
        print(f"[WebSocket] Server error: {e}")

def schedule_broadcast(message_payload: dict):
    if WS_EVENT_LOOP and CONNECTED_CLIENTS:
        asyncio.run_coroutine_threadsafe(
            broadcast_message_to_clients(json.dumps(message_payload)),
            WS_EVENT_LOOP
        )

if __name__ == '__main__':
    run_server_in_thread()