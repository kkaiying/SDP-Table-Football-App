import redis
import json
import serial
import time

rod_limits = [
        (394.9, 305.1),
        (394.03, 305.97),
        (394.03, 305.97),
        (394.03, 305.97),
        (394.03, 305.97),
        (394.03, 305.97),
        (394.97, 305.97),
        (394.9, 305.1)
            ]

binary_digits = [
        "0000",
        "0001",
        "0010",
        "0011",
        "0100",
        "0101",
        "0110",
        "0111",
        "1000",
        "1001",
        "1010",
        "1011",
        "1100",
        "1101",
        "1110",
        "1111"]

serial_out = serial.Serial('/dev/serial0', 9600, timeout = 1)

def print_binary_8(number):
    print(binary_digits[number >> 4] + binary_digits[number & 0x0F])

def print_binary_8_double(number1, number2):
    print(binary_digits[number1 >> 4] + binary_digits[number1 & 0x0F] + " " + 
          binary_digits[number2 >> 4] + binary_digits[number2 & 0x0F])

def main():
    r = redis.Redis(host='localhost', port=6379, db=0)

    print("Waiting for incoming commands")

    while True:
        name, ticket = r.brpop('task_queue', timeout=0)
        data = json.loads(ticket)

        rod_switch = 0b01000000
        rod_id = data['rod']
        rod_switch = rod_switch | rod_id << 4

        #serial_out.write(rod_switch)

        command_byte = 0

        if data['type'] == 'slide':
            command_byte = 0b10000000
        
            #ratio = (data['position'] - rod_limits[rod_id][0]) / (rod_limits[rod_id][1] - rod_limits[rod_id][0])
            ratio = data['position']
            float_position = ratio * 63.0

            print("ratio: " + str(ratio))
            print("float_position: " + str(float_position))

            command_byte = command_byte | int(float_position)

            print_binary_8_double(rod_switch, command_byte)
            serial_out.write(bytes([rod_switch, command_byte]))
            #serial_out.write(command_byte)

        elif data['type'] == 'kick':
            command_byte = 0b11000000 + (data['fast'] << 5);

            command_byte += int(round(float(data['angle']) / 1.8)) // 10

            print_binary_8_double(rod_switch, command_byte)
            serial_out.write(bytes([rod_switch, command_byte]))
            #serial_out.write(command_byte)
            serial_out.flush();

if __name__ == "__main__":
    main()


# Opcodes:
# 
# 00 - No command
# 01 - Switch rod
# 10 - Slide
# 11 - Kick
# 
# 
# 
# 
