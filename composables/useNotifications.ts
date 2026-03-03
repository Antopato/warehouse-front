import { ref } from 'vue'

interface Notification {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}

const notifications = ref<Notification[]>([])
let nextId = 0

export function useNotifications() {
  function notify(message: string, type: Notification['type'] = 'info') {
    const id = nextId++
    notifications.value.push({ id, type, message })
    setTimeout(() => {
      notifications.value = notifications.value.filter((n) => n.id !== id)
    }, 4000)
  }

  function success(message: string) {
    notify(message, 'success')
  }

  function error(message: string) {
    notify(message, 'error')
  }

  function warning(message: string) {
    notify(message, 'warning')
  }

  return { notifications, notify, success, error, warning }
}
