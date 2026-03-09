#!/bin/bash

if [ $1 == "emu" ]; then
	echo "Emulating Pi serial output"
	sudo socat -d -d pty,link=/dev/serial0 pty,link=/dev/serial1 &
	pid4=$!
fi

echo "Starting server..."

cd server 

npm start &
pid1=$!

sudo /usr/bin/python3 handler.py &
pid2=$!

cd ../

npm run dev -- --host &
pid3=$!

echo "Server started"

closeServer() {
	echo "Stopping server..."
	kill "$pid1" "$pid2" "$pid3" 2>/dev/null
	wait "$pid1" "$pid2" "$pid3" 2>/dev/null
	if [ $1 == "emu" ]; then
		kill "$pid4" 2>/dev/null	
	fi
	echo "Server stopped"
}

trap closeServer SIGINT SIGTERM EXIT

wait
