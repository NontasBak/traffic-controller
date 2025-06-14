import serial
import threading
import tkinter as tk
import time
import websocket_server
from trafficLightGUI import TrafficLightGUI
from mock_arduino import mock_arduino_data_and_gui

# Ports and baud rate

RECEIVER_PORT = 'COM9'
BAUD_RATE = 9600

def serial_relay_and_gui():
    try:
        receiver = serial.Serial(RECEIVER_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)

        print("Reading data from Receiver...\n")

        while True:
            if receiver.in_waiting > 0:
                line = receiver.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"[Receiver] {line}")
                    # gui.root.after(0, gui.update_lights, line)

                    values = line.split(',')
                    current_light = int(values[0])
                    light_timer_seconds = int(values[1])
                    fast_speed = int(values[2])
                    print(current_light, light_timer_seconds, fast_speed)

                    message_payload = {
                        "current_light": current_light,
                        "light_timer_seconds": light_timer_seconds,
                        "fast_speed": fast_speed,
                    }

                    websocket_server.schedule_broadcast(message_payload)

            time.sleep(0.01)

    except serial.SerialException as e:
        print(f"[Serial Error] {e}")
    except Exception as e:
        print(f"[Error] {e}")


if __name__ == "__main__":
    websocket_thread = threading.Thread(target=websocket_server.run_server_in_thread, daemon=True)
    websocket_thread.start()

    # Only for testing purposes
    mock_thread = threading.Thread(target=mock_arduino_data_and_gui, daemon=True)
    mock_thread.start()

    # Actual implementation
    # serial_thread = threading.Thread(target=serial_relay_and_gui, daemon=True)
    # serial_thread.start()

    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")