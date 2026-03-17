let ws = null

  export function connectToServer() {
    const host = window.location.hostname;
    //ws = new WebSocket('ws://localhost:8080') 
    //ws = new WebSocket('ws://100.84.232.141:8080')
    ws = new WebSocket(`ws://${host}:8080`);
    //ws = new WebSocket('ws://192.168.18.115:8080');

    ws.onopen = () => {
      console.log('Connected to server')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('Disconnected from server')
    }

    return ws
  }

  export function sendSlideCommand(rod, position) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    const command = {
      type: 'slide',
      rod,
      position,
      timestamp: Date.now()
    }

    ws.send(JSON.stringify(command))
    console.log('Sent slide:', command)
    return true
  }

  export function sendKickCommand(rod, level, direction) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    const command = {
      type: 'kick',
      rod,
      level,
      direction,
      timestamp: Date.now()
    }

    ws.send(JSON.stringify(command))
    console.log('Sent kick:', command)
    return true
  }
