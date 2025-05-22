import serial
import threading
import tkinter as tk
import time
import websocket_server
from trafficLightGUI import TrafficLightGUI
from mock_arduino import mock_arduino_data_and_gui

# Ports and baud rate

RECEIVER_PORT = 'COM13'
BAUD_RATE = 9600

def serial_relay_and_gui(gui: TrafficLightGUI):
    try:
        receiver = serial.Serial(RECEIVER_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)

        print("Reading data from Receiver...\n")

        while True:
            if receiver.in_waiting > 0:
                line = receiver.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"[Receiver] {line}")
                    gui.root.after(0, gui.update_lights, line)

                    # Prepare the message payload for WebSocket broadcast
                    light1_status = "gray"
                    light2_status = "gray"

                    if line == "road X":
                        light1_status = "green"
                        light2_status = "red"
                    elif line == "road Y":
                        light1_status = "red"
                        light2_status = "green"

                    message_payload = {
                        "light1State": light1_status,
                        "light2State": light2_status
                    }

                    websocket_server.schedule_broadcast(message_payload)

            time.sleep(0.01)

    except serial.SerialException as e:
        print(f"[Serial Error] {e}")
    except Exception as e:
        print(f"[Error] {e}")


if __name__ == "__main__":
    root = tk.Tk()
    gui = TrafficLightGUI(root)

    websocket_thread = threading.Thread(target=websocket_server.run_server_in_thread, daemon=True)
    websocket_thread.start()

    # Only for testing purposes
    # mock_thread = threading.Thread(target=mock_arduino_data_and_gui, args=(gui,), daemon=True)
    # mock_thread.start()

    # Actual implementation
    serial_thread = threading.Thread(target=serial_relay_and_gui, args=(gui,), daemon=True)
    serial_thread.start()

    root.mainloop()
