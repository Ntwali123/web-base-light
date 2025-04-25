import asyncio
import json
import websockets
import subprocess
from datetime import datetime

MQTT_BROKER = "localhost"
MQTT_TOPIC = "light/schedule"
MOSQUITTO_PUB = "C:\\Program Files\\Mosquitto\\mosquitto_pub.exe"

async def publish_to_mqtt(message):
    try:
        cmd = [
            MOSQUITTO_PUB,
            "-h", MQTT_BROKER,
            "-t", MQTT_TOPIC,
            "-m", message
        ]
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            print(f"Error publishing to MQTT: {stderr.decode()}")
            return False
        return True
    except Exception as e:
        print(f"Error executing mosquitto_pub: {e}")
        return False

async def handle_client(websocket):
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                on_time = data.get('onTime')
                off_time = data.get('offTime')

                if not on_time or not off_time:
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "Invalid schedule format"
                    }))
                    continue

                schedule = json.dumps({
                    "on_time": on_time,
                    "off_time": off_time,
                    "timestamp": datetime.now().isoformat()
                })

                if await publish_to_mqtt(schedule):
                    await websocket.send(json.dumps({
                        "status": "success",
                        "message": "Schedule set successfully"
                    }))
                else:
                    await websocket.send(json.dumps({
                        "status": "error",
                        "message": "Failed to set schedule"
                    }))

            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "status": "error",
                    "message": "Invalid JSON format"
                }))

    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")

async def main():
    server = await websockets.serve(handle_client, "localhost", 8767)
    print("WebSocket server started on ws://localhost:8767")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main()) 