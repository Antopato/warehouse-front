import { defineStore } from 'pinia'

interface StockAlert {
  code: string
  name: string
  quantity: number
  location: string | null
  severity: 'critical' | 'warning'
}

interface AlertsState {
  alerts: StockAlert[]
  dismissedCodes: string[]
  lastUpdated: string | null
}

export const useAlertsStore = defineStore('alerts', {
  state: (): AlertsState => ({
    alerts: [],
    dismissedCodes: [],
    lastUpdated: null,
  }),
  getters: {
    activeAlerts: (state) =>
      state.alerts.filter((a) => !state.dismissedCodes.includes(a.code)),
    activeCount(): number {
      return this.activeAlerts.length
    },
    criticalAlerts(): StockAlert[] {
      return this.activeAlerts.filter((a) => a.severity === 'critical')
    },
    warningAlerts(): StockAlert[] {
      return this.activeAlerts.filter((a) => a.severity === 'warning')
    },
  },
  actions: {
    setAlerts(alerts: StockAlert[], timestamp: string) {
      this.alerts = alerts
      this.lastUpdated = timestamp
      // Clear dismissed codes for products no longer in low stock
      const currentCodes = alerts.map((a) => a.code)
      this.dismissedCodes = this.dismissedCodes.filter((code) =>
        currentCodes.includes(code)
      )
    },
    dismissAlert(code: string) {
      if (!this.dismissedCodes.includes(code)) {
        this.dismissedCodes.push(code)
      }
    },
    dismissAll() {
      this.dismissedCodes = this.alerts.map((a) => a.code)
    },
  },
  persist: {
    pick: ['dismissedCodes'],
  },
})
