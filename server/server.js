const WebSocket = require('ws')
const redis = require('redis')

  const wss = new WebSocket.Server({ port: 8080 })
  const client = redis.createClient();

  client.on('error', (err) => {
    console.error('Redis error:', err);
  });

  wss.on('connection', (ws) => {
    console.log('Client connected')

    ws.on('message', (data) => {
      try {
        const command = JSON.parse(data)
        console.log('Received command:', command)

        if (!command.rod || !command.type) {
          console.error('Invalid command format')
          return
        }

        if (command.type === 'slide') {
          handleSlideCommand(command)
        } else if (command.type === 'kick') {
          handleKickCommand(command)
        }

	handleIncomingData(data);

      } catch (err) {
        console.error('Parse error:', err)
      }
    })

    ws.on('close', () => {
      console.log('Client disconnected')
    })
  })

  function handleSlideCommand(command) {
    console.log(`Moving rod ${command.rod} to position ${command.position}`)
    // sliding
  }

  function handleKickCommand(command) {
    console.log(`Kicking rod ${command.rod} with level ${command.level}, direction: 
  ${command.direction}`)
    // kick
  }

  function handleIncomingData(jsonData) {
    client.lpush('task_queue', jsonData, (err, reply) => {
      if (err) {
        console.error('Failed to push to Redis:', err);
      } else {
        console.log('Data queued. Items in queue:', reply);
      }
    });
  }

  console.log('WebSocket server running on ws://localhost:8080')
