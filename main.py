import serial
import time

sender_port = 'COM16'
receiver_port = 'COM13'
baud_rate = 9600

try:
    # Open both serial ports
    sender = serial.Serial(sender_port, baud_rate, timeout=1)
    receiver = serial.Serial(receiver_port, baud_rate, timeout=1)

    time.sleep(2)  # Allow both Arduinos to reset

    print("Relaying data from Sender (COM16) to Receiver (COM13)...\n")

    while True:
        if sender.in_waiting:
            line = sender.readline().decode('utf-8', errors='ignore').strip()
            if line:
                print(f"[Sender] {line}")
                receiver.write((line + '\n').encode('utf-8'))

except serial.SerialException as e:
    print(f"[Error] {e}")
except KeyboardInterrupt:
    print("\n[Stopped by user]")
finally:
    if sender and sender.is_open:
        sender.close()
    if receiver and receiver.is_open: 
        receiver.close()
