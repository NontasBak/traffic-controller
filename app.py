import serial
import threading
import tkinter as tk
import time

# Ports and baud rate
SENDER_PORT = 'COM16'
RECEIVER_PORT = 'COM13'
BAUD_RATE = 9600

class TrafficLightGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Traffic Light Monitor")

        self.canvas_size = 300
        self.circle_radius = 25
        self.center = self.canvas_size // 2

        self.canvas = tk.Canvas(root, width=self.canvas_size, height=self.canvas_size, bg="white")
        self.canvas.pack(padx=20, pady=10)

        self.status_label = tk.Label(root, text="Waiting for data...", font=("Arial", 14))
        self.status_label.pack(pady=10)

        r = self.circle_radius
        c = self.center

        # Create 4 symmetric traffic lights
        self.lights = {
            'x1': self.canvas.create_oval(c - 100 - r, c - r, c - 100 + r, c + r, fill="green"),  # Left
            'x2': self.canvas.create_oval(c + 100 - r, c - r, c + 100 + r, c + r, fill="green"),  # Right
            'y1': self.canvas.create_oval(c - r, c - 100 - r, c + r, c - 100 + r, fill="gray"),  # Top
            'y2': self.canvas.create_oval(c - r, c + 100 - r, c + r, c + 100 + r, fill="gray")   # Bottom
        }

    def update_lights(self, message):
        self.status_label.config(text=f"Current: {message}")

        if message == "road X":
            self.canvas.itemconfig(self.lights['x1'], fill="green")
            self.canvas.itemconfig(self.lights['x2'], fill="green")
            self.canvas.itemconfig(self.lights['y1'], fill="red")
            self.canvas.itemconfig(self.lights['y2'], fill="red")

        elif message == "road Y":
            self.canvas.itemconfig(self.lights['x1'], fill="red")
            self.canvas.itemconfig(self.lights['x2'], fill="red")
            self.canvas.itemconfig(self.lights['y1'], fill="green")
            self.canvas.itemconfig(self.lights['y2'], fill="green")

        else:
            for light in self.lights.values():
                self.canvas.itemconfig(light, fill="gray")

def serial_relay_and_gui(gui: TrafficLightGUI):
    try:
        sender = serial.Serial(SENDER_PORT, BAUD_RATE, timeout=1)
        receiver = serial.Serial(RECEIVER_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)

        print("Relaying data from Sender to Receiver...\n")

        while True:
            if sender.in_waiting:
                line = sender.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    print(f"[Sender] {line}")
                    receiver.write((line + '\n').encode('utf-8'))
                    gui.root.after(0, gui.update_lights, line)

    except serial.SerialException as e:
        print(f"[Serial Error] {e}")
    except Exception as e:
        print(f"[Error] {e}")

if __name__ == "__main__":
    root = tk.Tk()
    gui = TrafficLightGUI(root)

    thread = threading.Thread(target=serial_relay_and_gui, args=(gui,), daemon=True)
    thread.start()

    root.mainloop()
