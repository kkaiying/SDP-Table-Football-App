const WebSocket = require('ws')
  const wss = new WebSocket.Server({ port: 8080 })

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

  console.log('WebSocket server running on ws://localhost:8080')