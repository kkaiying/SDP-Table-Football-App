#!/bin/bash

echo "Starting server..."

cd server 

npm start &
pid1=$!

python3 handler.py &
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
