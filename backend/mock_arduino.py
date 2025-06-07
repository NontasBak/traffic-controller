from trafficLightGUI import TrafficLightGUI
import websocket_server
import time

# Only for testing purposes, do not use in production
def mock_arduino_data_and_gui():
    print("[MOCK] Starting mock Arduino data sender...\n")
    possible_messages = ["road X", "road Y"]
    current_message_index = 0
    try:
        while True:
            # Simulate receiving a message
            line = possible_messages[current_message_index]
            current_message_index = (current_message_index + 1) % len(possible_messages) # Cycle through messages
            
            print(f"[MOCK] Generated: {line}")
            # gui.root.after(0, gui.update_lights, line)

            # Prepare message for WebSocket clients
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
                "light2State": light2_status,
            }
            
            websocket_server.schedule_broadcast(message_payload)
            
            time.sleep(5) # Send a new message every 5 seconds

    except Exception as e:
        print(f"[Error in mock_arduino_data_and_gui] {e}")
    finally:
        print("[MOCK] Mock Arduino data sender thread finished.")