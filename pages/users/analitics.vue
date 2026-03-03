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
              <i class="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <div class="stat-card__value">{{ formatCurrency(stats.total_margin) }}</div>
              <div class="stat-card__label">Margen total</div>
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

      <!-- Charts -->
      <div class="dashboard-tables">
        <div class="content-card">
          <div class="content-card__header">
            <h3 style="font-size: 1rem; margin: 0">
              <i class="bi bi-pie-chart text-primary me-2"></i>
              Ventas por categoria
            </h3>
          </div>
          <div class="content-card__body">
            <div v-if="pieChartData" style="max-width: 400px; margin: 0 auto">
              <Pie :data="pieChartData" :options="pieChartOptions" />
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-pie-chart"></i>
              <p>No hay datos de categorias</p>
            </div>
          </div>
        </div>

        <div class="content-card">
          <div class="content-card__header">
            <h3 style="font-size: 1rem; margin: 0">
              <i class="bi bi-graph-up text-success me-2"></i>
              Margen diario (ultimos 30 dias)
            </h3>
          </div>
          <div class="content-card__body">
            <div v-if="marginChartData">
              <Line :data="marginChartData" :options="lineChartOptions" />
            </div>
            <div v-else class="empty-state">
              <i class="bi bi-graph-up"></i>
              <p>No hay datos de margen</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Pie, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

interface AnaliticsStats {
  total_products: number
  total_categories: number
  total_users: number
  total_margin: number
  total_stock_value: number
  low_stock_count: number
}

const { apiGet } = useApi()
const { formatCurrency } = useFormatters()
const loading = ref(true)
const stats = ref<AnaliticsStats>({
  total_products: 0,
  total_categories: 0,
  total_users: 0,
  total_margin: 0,
  total_stock_value: 0,
  low_stock_count: 0,
})

const pieChartData = ref<any>(null)
const marginChartData = ref<any>(null)

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const },
  },
}

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: any) => value + ' €',
      },
    },
  },
}

const CHART_COLORS = [
  '#0d6efd', '#198754', '#ffc107', '#dc3545',
  '#0dcaf0', '#6f42c1', '#fd7e14', '#20c997',
  '#6610f2', '#d63384',
]

onMounted(async () => {
  try {
    const [dashboardData, categoryData, marginData] = await Promise.all([
      apiGet<{ stats: AnaliticsStats }>('/dashboard/'),
      apiGet<{ labels: string[]; values: number[] }>('/charts/sales-by-category'),
      apiGet<{ labels: string[]; values: number[] }>('/charts/daily-margin'),
    ])

    stats.value = dashboardData.stats

    if (categoryData.labels.length) {
      pieChartData.value = {
        labels: categoryData.labels,
        datasets: [
          {
            data: categoryData.values,
            backgroundColor: CHART_COLORS.slice(0, categoryData.labels.length),
          },
        ],
      }
    }

    if (marginData.labels.length) {
      marginChartData.value = {
        labels: marginData.labels,
        datasets: [
          {
            data: marginData.values,
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
        ],
      }
    }
  } catch (err) {
    console.error('Error loading analytics:', err)
  } finally {
    loading.value = false
  }
})
</script>
