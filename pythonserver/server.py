import asyncio
import threading
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import redis
import time

clients: set[WebSocket] = set()
_loop: asyncio.AbstractEventLoop | None = None
_loop_ready = threading.Event()


def on_tracker_message(message: dict) -> None:
    """Called from the main thread — schedules a broadcast on the server event loop."""
    _loop_ready.wait()
    future = asyncio.run_coroutine_threadsafe(broadcast_to_clients(message), _loop)

    def _log_future_error(fut):
        try:
            fut.result()
        except Exception as e:
            print(f"Broadcast scheduling error: {e}")

    future.add_done_callback(_log_future_error)


app = FastAPI()


async def client_heartbeat_loop(websocket: WebSocket) -> None:
    seq = 0
    while True:
        await websocket.send_text(json.dumps({"type": "heartbeat", "seq": seq}))
        seq += 1
        await asyncio.sleep(1.0)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)
    print("Client connected")
    await websocket.send_text(json.dumps({"type": "server_hello", "message": "connected"}))
    heartbeat_task = asyncio.create_task(client_heartbeat_loop(websocket))
    pi_redis = redis.Redis(host='192.168.86.116', port=6379, db=0)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                command = json.loads(data)
                print(f"Received command: {command}")

                command_type = command.get("type")
                if not command_type:
                    print("Invalid command format: missing type")
                    continue

                if command_type == "slide":
                    if command.get("rod") is None or command.get("position") is None:
                        print("Invalid slide command format")
                        continue
                    handle_slide_command(command, pi_redis)
                elif command_type == "kick":
                    if command.get("rod") is None or command.get("level") is None:
                        print("Invalid kick command format")
                        continue
                    handle_kick_command(command, pi_redis)
                elif command_type == "charge":
                    if command.get("rod") is None or command.get("enable") is None:
                        print("Invalid charge command format")
                        continue
                    handle_charge_command(command, pi_redis)
                elif command_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": command.get("timestamp")}))
                else:
                    print(f"Unknown command type: {command_type}")

            except json.JSONDecodeError as e:
                print(f"Parse error: {e}")

    except WebSocketDisconnect:
        print("Client disconnected")
    finally:
        heartbeat_task.cancel()
        clients.discard(websocket)


def handle_slide_command(command: dict, pi_redis: redis.Redis) -> None:
    rods = (1, 2, 4, 6)
    position = (command["position"] - 371) / (478 - 371)
    if position < 0.0:
        position = 0.0
    elif position > 1.0:
        position = 1.0
    position = 1.0 - position
    print(f"Moving rod {command['rod']} to position {position}")
    print(rods.index(command["rod"]))
    output = json.dumps({
        "type": "slide",
        "rod": rods.index(command["rod"]),
        "position": position,
    })
    pi_redis.lpush("task_queue", output)
    print(output)


def handle_kick_command(command: dict, pi_redis: redis.Redis) -> None:
    print(f"Kicking rod {command['rod']} with level {command['level']}, direction: {command['direction']}")
    rods = (1, 2, 4, 6)
    output = json.dumps({
        "type": "kick",
        "rod": rods.index(command["rod"]),
        "angle": 72,
        "fast": command["level"] - 1,
    })
    pi_redis.lpush("task_queue", output)
    print(output)

    def return_after_delay():
        time.sleep(0.3)
        output = json.dumps({
            "type": "kick",
            "rod": rods.index(command["rod"]),
            "angle": 0,
            "fast": 1,
        })
        pi_redis.lpush("task_queue", output)
        print(output)

    threading.Thread(target=return_after_delay).start()


def handle_charge_command(command: dict, pi_redis: redis.Redis):
    print(f"{"Charging" if command["enable"] else "Discharging"} rod {command["rod"]}")
    rods = (1, 2, 4, 6)
    output = json.dumps({
        "type": "kick",
        "rod": rods.index(command["rod"]),
        "angle": -54 if command["enable"] else 0,
        "fast": 0,
    })
    print(output)
    pi_redis.lpush("task_queue", output)


async def broadcast_to_clients(message: dict) -> None:
    disconnected = set()
    for client in list(clients):
        await client.send_text(json.dumps(message))
    clients.difference_update(disconnected)


def start_server() -> None:
    async def serve():
        global _loop
        _loop = asyncio.get_running_loop()
        _loop_ready.set()
        config = uvicorn.Config(app, host="0.0.0.0", port=8000)
        server = uvicorn.Server(config)
        server.install_signal_handlers = False  # required when not on the main thread
        await server.serve()

    asyncio.run(serve())


if __name__ == "__main__":
    print("WebSocket server running on ws://localhost:8000/ws")
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    local_redis = redis.Redis(host='localhost', port=6379, db=0)

    sequence_num = 0
    while True:
        on_tracker_message({
            "type": "ball_position",
            "x": float(local_redis.get("ball_x")),
            "y": float(local_redis.get("ball_y")),
            "sequenceNum": sequence_num,
            "status": "tracked",
            "coasting": False,
            "detected": True,
        })
        opp_positions = {}                                                                  
        for key in ["opp_gk", "opp_defence", "opp_midfield", "opp_striker"]:
            val = local_redis.get(key + "_position")
            if val is not None:
                opp_positions[key] = float(val)
        if opp_positions:
            on_tracker_message({"type": "opponent_positions", **opp_positions})
        sequence_num += 1
        time.sleep(0.033)
