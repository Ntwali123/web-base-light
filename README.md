# Smart Light Scheduler

A modern web-based IoT system for scheduling light controls using a graphical interface. The system features a beautiful UI with light/dark mode, animated particles background, and smooth transitions. It uses WebSocket for real-time communication, MQTT for message queuing, and interfaces with an Arduino for physical light control.

## Features

1. **Modern User Interface**:
   - Light/Dark mode with persistent theme
   - Animated particles background
   - Smooth transitions and animations
   - Responsive design for all screen sizes
   - Interactive status feedback

2. **Real-time Communication**:
   - WebSocket for instant updates
   - MQTT message queuing
   - Arduino integration

## System Architecture

1. **Frontend**: Modern HTML/CSS/JS web interface with animations
2. **WebSocket Server**: Python server that receives schedules and publishes to MQTT
3. **MQTT Subscriber**: Python script that receives schedules and controls Arduino
4. **Arduino**: Receives commands via serial port and controls the relay

## Prerequisites

- Python 3.7+
- Mosquitto MQTT Broker
- Arduino UNO with relay module
- Modern web browser with JavaScript enabled

## Installation

1. Install the MQTT broker:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients

   # macOS
   brew install mosquitto

   # Windows
   Download and install from https://mosquitto.org/download/
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Connect Arduino:
   - Upload the provided Arduino sketch
   - Connect the relay module to the appropriate pin
   - Note the serial port (e.g., /dev/ttyACM0, COM3)
   - Update `ARDUINO_PORT` in mqtt_subscriber.py if needed

## Usage

1. Start the MQTT broker:
   ```bash
   mosquitto
   ```

2. Start the WebSocket server:
   ```bash
   python websocket_server.py
   ```

3. Start the MQTT subscriber:
   ```bash
   python mqtt_subscriber.py
   ```

4. Open index.html in a web browser:
   - Toggle light/dark mode using the theme button
   - Set the ON time
   - Set the OFF time
   - Click Submit to update the schedule
   - Watch for visual feedback and status updates

## File Structure

```
.
├── index.html          # Web interface with particle animation
├── styles.css          # CSS styling with theme support
├── script.js           # Frontend JavaScript with animations
├── websocket_server.py # WebSocket to MQTT bridge
├── mqtt_subscriber.py  # MQTT subscriber and Arduino controller
└── requirements.txt    # Python dependencies
```

## UI Features

1. **Theme Support**:
   - Light/Dark mode toggle
   - Theme persistence across sessions
   - Smooth theme transitions

2. **Animations**:
   - Floating particles background
   - Interactive button effects
   - Status message transitions
   - Loading and success animations

3. **Responsive Design**:
   - Works on all screen sizes
   - Adaptive layout
   - Touch-friendly interface

## Troubleshooting

1. **WebSocket Connection Failed**
   - Ensure the WebSocket server is running
   - Check if port 8767 is available

2. **MQTT Publishing Failed**
   - Verify Mosquitto broker is running
   - Check MQTT broker address and port

3. **Arduino Connection Failed**
   - Verify correct serial port in mqtt_subscriber.py
   - Check USB connection
   - Ensure correct baud rate (9600)

## Security Considerations

This is a basic implementation. For production use, consider:
- WebSocket security (WSS)
- MQTT authentication
- Input validation
- Error handling
- Secure serial communication

## License

MIT License 