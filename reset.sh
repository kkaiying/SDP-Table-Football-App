#!/bin/bash
stty -F /dev/arduinoLeft hupcl
stty -F /dev/arduinoRight hupcl
echo > /dev/arduinoLeft
echo > /dev/arduinoRight
