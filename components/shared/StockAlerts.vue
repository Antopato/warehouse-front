<template>
  <div class="alerts-bell" ref="alertsRef">
    <button
      class="alerts-bell__button"
      :class="{ 'alerts-bell__button--active': alertsStore.activeCount > 0 }"
      @click="showPanel = !showPanel"
      :title="`${alertsStore.activeCount} alertas de stock`"
    >
      <i class="bi bi-bell"></i>
      <span v-if="alertsStore.activeCount > 0" class="alerts-bell__badge">
        {{ alertsStore.activeCount > 99 ? '99+' : alertsStore.activeCount }}
      </span>
    </button>

    <!-- Dropdown Panel -->
    <div v-if="showPanel" class="alerts-panel">
      <div class="alerts-panel__header">
        <span class="alerts-panel__title">Alertas de stock</span>
        <button
          v-if="alertsStore.activeCount > 0"
          class="alerts-panel__dismiss-all"
          @click="alertsStore.dismissAll()"
        >
          Marcar todas leidas
        </button>
      </div>

      <div class="alerts-panel__body">
        <template v-if="alertsStore.activeAlerts.length > 0">
          <div
            v-for="alert in sortedAlerts"
            :key="alert.code"
            :class="[
              'alerts-panel__item',
              alert.severity === 'critical'
                ? 'alerts-panel__item--critical'
                : 'alerts-panel__item--warning'
            ]"
          >
            <div class="alerts-panel__item-content">
              <div class="alerts-panel__item-name">
                <i
                  :class="alert.severity === 'critical'
                    ? 'bi bi-exclamation-circle-fill text-danger'
                    : 'bi bi-exclamation-triangle-fill text-warning'"
                ></i>
                {{ alert.name }}
              </div>
              <div class="alerts-panel__item-details">
                <span class="text-muted">{{ alert.code }}</span>
                <span :class="alert.quantity === 0 ? 'text-danger fw-bold' : 'text-warning'">
                  Stock: {{ alert.quantity }}
                </span>
              </div>
            </div>
            <button
              class="alerts-panel__item-dismiss"
              @click.stop="alertsStore.dismissAlert(alert.code)"
              title="Descartar"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </template>

        <div v-else class="alerts-panel__empty">
          <i class="bi bi-check-circle text-success"></i>
          <p>Sin alertas de stock</p>
        </div>
      </div>

      <div v-if="alertsStore.lastUpdated" class="alerts-panel__footer">
        Actualizado: {{ formatTimestamp(alertsStore.lastUpdated) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAlertsStore } from '~/stores/alerts'

const alertsStore = useAlertsStore()

const showPanel = ref(false)
const alertsRef = ref<HTMLElement | null>(null)

const sortedAlerts = computed(() => {
  return [...alertsStore.activeAlerts].sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1
    if (a.severity !== 'critical' && b.severity === 'critical') return 1
    return a.quantity - b.quantity
  })
})

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

function handleClickOutside(event: MouseEvent) {
  if (alertsRef.value && !alertsRef.value.contains(event.target as Node)) {
    showPanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.alerts-bell {
  position: relative;
}

.alerts-bell__button {
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  position: relative;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  transition: color var(--transition-fast);
  border-radius: var(--border-radius-sm);
}

.alerts-bell__button:hover,
.alerts-bell__button--active {
  color: var(--color-warning);
}

.alerts-bell__badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-danger);
  color: var(--color-white);
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  transform: translate(25%, -25%);
}

.alerts-panel {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  right: 0;
  width: 360px;
  max-height: 480px;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.alerts-panel__header {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alerts-panel__title {
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--color-dark);
}

.alerts-panel__dismiss-all {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  padding: 0;
}

.alerts-panel__dismiss-all:hover {
  text-decoration: underline;
}

.alerts-panel__body {
  overflow-y: auto;
  max-height: 360px;
  flex: 1;
}

.alerts-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}

.alerts-panel__item:last-child {
  border-bottom: none;
}

.alerts-panel__item:hover {
  background-color: var(--color-bg);
}

.alerts-panel__item--critical {
  border-left: 3px solid var(--color-danger);
}

.alerts-panel__item--warning {
  border-left: 3px solid var(--color-warning);
}

.alerts-panel__item-content {
  flex: 1;
  min-width: 0;
}

.alerts-panel__item-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-dark);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.alerts-panel__item-details {
  font-size: var(--font-size-xs);
  display: flex;
  gap: var(--spacing-md);
  margin-top: 2px;
}

.alerts-panel__item-dismiss {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  font-size: var(--font-size-base);
  flex-shrink: 0;
}

.alerts-panel__item-dismiss:hover {
  color: var(--color-danger);
}

.alerts-panel__empty {
  padding: var(--spacing-xl);
  text-align: center;
  color: var(--color-text-muted);
}

.alerts-panel__empty i {
  font-size: var(--font-size-2xl);
  display: block;
  margin-bottom: var(--spacing-sm);
}

.alerts-panel__empty p {
  margin: 0;
  font-size: var(--font-size-sm);
}

.alerts-panel__footer {
  padding: var(--spacing-xs) var(--spacing-md);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}
</style>
