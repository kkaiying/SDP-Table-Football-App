const WebSocket = require('ws')
const redis = require('redis')

  const wss = new WebSocket.Server({ port: 8080 })
  const client = redis.createClient();
  const receive = redis.createClient();

  // Rod IDs to swap
  const valid_rod_ids = [1, 2, 4, 6]

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
    // Convert json buffer to json object for editing
    const jsonString = jsonData.toString();
    const data = JSON.parse(jsonString);

    // Get index of rod
    const rod_index = valid_rod_ids.indexOf(data.rod);

    // If a valid rod (red)
    if (rod_index > -1) {

      // Change the rod index in the json to match the expected index
      data.rod = rod_index;

      // Convert back into buffer to send to socket
      const newString = JSON.stringify(data);
      const newBuffer = Buffer.from(newString);

      // Push json to socket
      client.lpush('task_queue', newBuffer, (err, reply) => {
        if (err) {
          console.error('Failed to push to Redis:', err);
        } else {
          console.log('Data queued. Items in queue:', reply);
        }
      });
    }
  }

  receive.on("message", (channel, message) => {
    const data = JSON.parse(message);
    console.log(`Received from ${channel}:`, data);
  });

  console.log('WebSocket server running on ws://localhost:8080');
  receive.subscribe("playerUpdate");
