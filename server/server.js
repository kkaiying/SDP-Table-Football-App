const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })
const clients = new Set()

wss.on('connection', (ws) => {
  console.log('Client connected')
  clients.add(ws)

  ws.on('message', (data) => {
    try {
      const command = JSON.parse(data)
      console.log('Received command:', command)

      // Handle ball position from CV
      if (command.type === 'ball_position') {
        broadcastToClients(command)
        return
      }

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

function broadcastToClients(message) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message))
    }
  })
}

console.log('WebSocket server running on ws://localhost:8080')