import serial
import json
import redis

playerPositions = {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0
}

arduinoLeft = serial.Serial('/dev/arduinoLeft', 9600)
arduinoRight = serial.Serial('/dev/arduinoRight', 9600)

redisHost = redis.Redis(host='localhost', port=6379, decode_responses=True)

arduinoLeftData = ''
arduinoRightData = ''

positionChanged = 0

while True:
    if arduinoLeft.in_waiting > 0:
        arduinoLeftData = arduinoLeft.read(arduinoLeft.in_waiting)
        psotionChanged = 1
    if arduinoRight.in_waiting > 0:
        arduinoRightData = arduinoRight.read(arduinoRight.in_waiting)
        positionChanged = 1

    if arduinoLeftData:
        for inByte in arduinoLeftData:
            playerNumber = (inByte & 0b11000000) >> 6
            playerPosition = inByte & 0b00111111

            playerPositions[str(playerNumber)] = playerPosition
    
    if arduinoRightData:
        for inByte in arduinoRightData:
            playerNumber = (inByte & 0b11000000) >> 6
            playerPosition = inByte & 0b00111111

            playerPositions[str(playerNumber)] = playerPosition

    if positionChanged > 1:
        redisHost.publish('playerUpdate', json.dumps(playerPositions))
