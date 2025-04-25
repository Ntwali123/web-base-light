import json
import subprocess
import serial
import time
from datetime import datetime
import threading

MQTT_BROKER = "localhost"
MQTT_TOPIC = "light/schedule"
ARDUINO_PORT = "COM3"  
BAUD_RATE = 9600
TEST_MODE = True

class LightController:
    def __init__(self):
        self.current_schedule = None
        self.serial_port = None
        self.running = True
        self.test_mode = TEST_MODE

    def connect_to_arduino(self):
        if self.test_mode:
            print("Running in test mode - Arduino connection simulated")
            return True
            
        try:
            self.serial_port = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=1)
            time.sleep(2)  
            print("Connected to Arduino")
            return True
        except serial.SerialException as e:
            print(f"Failed to connect to Arduino: {e}")
            return False

    def send_command(self, command):
        if self.test_mode:
            print(f"Test Mode - Simulated command sent: {command}")
            print(f"Light would turn {'ON' if command == '1' else 'OFF'}")
            return

        if self.serial_port and self.serial_port.is_open:
            try:
                self.serial_port.write(str(command).encode())
                print(f"Sent command: {command}")
            except serial.SerialException as e:
                print(f"Error sending command: {e}")

    def check_schedule(self):
        while self.running:
            if self.current_schedule:
                current_time = datetime.now().strftime("%H:%M")
                if current_time == self.current_schedule["on_time"]:
                    self.send_command("1")
                elif current_time == self.current_schedule["off_time"]:
                    self.send_command("0")
            time.sleep(30)  

    def start_schedule_checker(self):
        self.schedule_thread = threading.Thread(target=self.check_schedule)
        self.schedule_thread.daemon = True
        self.schedule_thread.start()

    def update_schedule(self, schedule_str):
        try:
            schedule = json.loads(schedule_str)
            self.current_schedule = {
                "on_time": schedule["on_time"],
                "off_time": schedule["off_time"]
            }
            print(f"\nNew schedule received:")
            print(f"Light will turn ON at: {self.current_schedule['on_time']}")
            print(f"Light will turn OFF at: {self.current_schedule['off_time']}")
            print(f"Current time is: {datetime.now().strftime('%H:%M')}\n")
        except json.JSONDecodeError as e:
            print(f"Error parsing schedule: {e}")

    def cleanup(self):
        self.running = False
        if not self.test_mode and self.serial_port and self.serial_port.is_open:
            self.serial_port.close()

def main():
    controller = LightController()
    
    if not controller.connect_to_arduino():
        print("Exiting due to Arduino connection failure")
        return

    controller.start_schedule_checker()
    print("\nMQTT Subscriber started in test mode")
    print("Waiting for schedule updates...")

    try:
        process = subprocess.Popen(
            ["C:\\Program Files\\Mosquitto\\mosquitto_sub.exe", "-h", MQTT_BROKER, "-t", MQTT_TOPIC],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )

        print(f"Subscribed to MQTT topic: {MQTT_TOPIC}")

        while True:
            output = process.stdout.readline()
            if output:
                controller.update_schedule(output.strip())
            
            if process.poll() is not None:
                print("MQTT subscriber process ended")
                break

    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        controller.cleanup()
        if process:
            process.terminate()

if __name__ == "__main__":
    main() 