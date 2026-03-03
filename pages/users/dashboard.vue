<template>
  <div>
    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <!-- Stats Grid -->
      <div class="dashboard-grid">
        <div class="stat-card">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-card__icon stat-card__icon--primary">
              <i class="bi bi-box"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ stats.total_products }}</div>
              <div class="stat-card__label">Productos</div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-card__icon stat-card__icon--success">
              <i class="bi bi-tags"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ stats.total_categories }}</div>
              <div class="stat-card__label">Categorias</div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-card__icon stat-card__icon--info">
              <i class="bi bi-people"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ stats.total_users }}</div>
              <div class="stat-card__label">Usuarios</div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-card__icon stat-card__icon--warning">
              <i class="bi bi-currency-euro"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ formatCurrency(stats.total_stock_value) }}</div>
              <div class="stat-card__label">Valor total stock</div>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="d-flex align-items-center gap-3">
            <div class="stat-card__icon stat-card__icon--danger">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ stats.low_stock_count }}</div>
              <div class="stat-card__label">Stock bajo</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tables -->
      <div class="dashboard-tables">
        <!-- Low Stock -->
        <div class="content-card">
          <div class="content-card__header">
            <h3 style="font-size: 1rem; margin: 0">
              <i class="bi bi-exclamation-triangle text-danger me-2"></i>
              Productos con stock bajo
            </h3>
          </div>
          <div class="content-card__body">
            <table v-if="lowStockProducts.length" class="data-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in lowStockProducts" :key="product.code">
                  <td><strong>{{ product.code }}</strong></td>
                  <td>{{ product.name }}</td>
                  <td>
                    <span :class="stockBadgeClass(product.quantity)">
                      {{ product.quantity }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <i class="bi bi-check-circle text-success"></i>
              <p>Todo el stock esta en niveles correctos</p>
            </div>
          </div>
        </div>

        <!-- Recent Products -->
        <div class="content-card">
          <div class="content-card__header">
            <h3 style="font-size: 1rem; margin: 0">
              <i class="bi bi-clock-history text-primary me-2"></i>
              Productos recientes
            </h3>
          </div>
          <div class="content-card__body">
            <table v-if="recentProducts.length" class="data-table">
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in recentProducts" :key="product.code">
                  <td><strong>{{ product.code }}</strong></td>
                  <td>{{ product.name }}</td>
                  <td>{{ product.quantity }}</td>
                  <td class="text-muted">{{ product.created_at }}</td>
                </tr>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <i class="bi bi-inbox"></i>
              <p>No hay productos registrados</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface DashboardStats {
  total_products: number
  total_categories: number
  total_users: number
  total_margin: number
  total_stock_value: number
  low_stock_count: number
}

interface LowStockProduct {
  code: string
  name: string
  quantity: number
  location: string | null
}

interface RecentProduct {
  code: string
  name: string
  quantity: number
  created_at: string
}

const { apiGet } = useApi()
const { formatCurrency } = useFormatters()
const loading = ref(true)
const stats = ref<DashboardStats>({
  total_products: 0,
  total_categories: 0,
  total_users: 0,
  total_margin: 0,
  total_stock_value: 0,
  low_stock_count: 0,
})
const lowStockProducts = ref<LowStockProduct[]>([])
const recentProducts = ref<RecentProduct[]>([])

function stockBadgeClass(qty: number): string {
  if (qty === 0) return 'badge-stock badge-stock--critical'
  if (qty <= 5) return 'badge-stock badge-stock--low'
  return 'badge-stock badge-stock--ok'
}

onMounted(async () => {
  try {
    const data = await apiGet<{
      stats: DashboardStats
      low_stock_products: LowStockProduct[]
      recent_products: RecentProduct[]
    }>('/dashboard/')
    stats.value = data.stats
    lowStockProducts.value = data.low_stock_products
    recentProducts.value = data.recent_products
  } catch (err) {
    console.error('Error loading dashboard:', err)
  } finally {
    loading.value = false
  }
})
</script>
