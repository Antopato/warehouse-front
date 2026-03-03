import { useAlertsStore } from '~/stores/alerts'

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let pingInterval: ReturnType<typeof setInterval> | null = null
const RECONNECT_DELAY = 5000
const PING_INTERVAL = 30000

export function useWebSocket() {
  const config = useRuntimeConfig()
  const wsBase = config.public.wsBase as string

  function connect() {
    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) return

    ws = new WebSocket(`${wsBase}/ws/alerts?token=${encodeURIComponent(token)}`)

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws?.readyState === WebSocket.OPEN) {
          ws.send('ping')
        }
      }, PING_INTERVAL)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'stock_alerts') {
          const alertsStore = useAlertsStore()
          alertsStore.setAlerts(data.alerts, data.timestamp)
        }
      } catch (e) {
        console.error('[WS] Failed to parse message:', e)
      }
    }

    ws.onclose = (event) => {
      cleanup()
      // Don't reconnect on auth failure
      if (event.code === 4001) return
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.onerror = () => {
      // onclose fires after onerror, handles reconnection
    }
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    cleanup()
    if (ws) {
      ws.close(1000, 'Client disconnect')
      ws = null
    }
  }

  function cleanup() {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  return { connect, disconnect }
}
