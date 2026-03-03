#!/bin/bash

if [ $1 == "emu" ]; then
	echo "Emulating Pi serial output"
	sudo socat -d -d pty,link=/dev/serial0 pty,link=/dev/serial1
fi

echo "Starting server..."

cd server 

npm start &
pid1=$!

sudo python3 handler.py &
pid2=$!

cd ../

npm run dev -- --host &
pid3=$!

echo "Server started"

closeServer() {
	echo "Stopping server..."
	kill "$pid1" "$pid2" "$pid3" 2>/dev/null
	wait "$pid1" "$pid2" "$pid3" 2>/dev/null
	echo "Server stopped"
}

trap closeServer SIGINT SIGTERM EXIT

wait
