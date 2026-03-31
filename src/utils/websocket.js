let ws = null
let reconnectTimer = null
let manuallyClosed = false
let pingTimer = null
const messageListeners = new Set()

function buildSocketUrl() {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname || 'localhost'
  return `${wsProtocol}//${host}:8000/ws`
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function clearPingTimer() {
  if (pingTimer) {
    clearInterval(pingTimer)
    pingTimer = null
  }
}

function scheduleReconnect() {
  if (manuallyClosed || reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connectToServer()
  }, 1000)
}

function notifyMessageListeners(event) {
  messageListeners.forEach((listener) => {
    try {
      listener(event)
    } catch (error) {
      console.error('WebSocket listener error:', error)
    }
  })
}

function attachSocketHandlers() {
  if (!ws) return

  ws.onopen = () => {
    clearReconnectTimer()
    clearPingTimer()
    pingTimer = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
      }
    }, 2000)
    console.log('Connected to server')
  }

  ws.onmessage = (event) => {
    notifyMessageListeners(event)
  }

  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  ws.onclose = () => {
    console.log('Disconnected from server')
    clearPingTimer()
    ws = null
    scheduleReconnect()
  }
}

export function connectToServer() {
  manuallyClosed = false
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws
  }

  ws = new WebSocket(buildSocketUrl())
  attachSocketHandlers()
  return ws
}

export function addMessageListener(listener) {
  messageListeners.add(listener)
  return () => {
    messageListeners.delete(listener)
  }
}

export function disconnectFromServer() {
  manuallyClosed = true
  clearReconnectTimer()
  clearPingTimer()
  if (ws) {
    ws.close()
    ws = null
  }
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

  export function sendChargeCommand(rod, enable) {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return false
    }

    const command = {
      type: 'charge',
      rod,
      enable: enable,
      timestamp: Date.now()
    }

    ws.send(JSON.stringify(command))
    console.log('Sent charge:', command)
    return true
  }
