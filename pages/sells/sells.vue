<template>
  <div>
    <div v-if="loading" class="loading-spinner">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else>
      <div class="dashboard-tables">
        

        <div class="content-card">
          <div class="content-card__header">
            <h3 style="font-size: 1rem; margin: 0">
              <i class="bi bi-clock-history text-primary me-2"></i>
              Ventas recientes
            </h3>
            <button class="btn btn-outline-primary mb-3" @click="navigateTo('/sells/add')">
              <i class="bi bi-cart-plus me-2"></i>
                Nueva Venta
            </button>
          </div>
          <div class="content-card__body">
            <table v-if="sales.length" class="data-table">
              <thead>
                <tr>
                  <th style="width: 40px"></th>
                  <th>Fecha</th>
                  <th>Vendedor</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Margen</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="sale in sales" :key="sale.id">
                  <tr @click="toggleExpand(sale.id)" style="cursor: pointer">
                    <td>
                      <i
                        :class="expanded === sale.id ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"
                        class="text-muted"
                      ></i>
                    </td>
                    <td>{{ formatDate(sale.created_at, true) }}</td>
                    <td>{{ sale.sold_by_name }}</td>
                    <td>
                      <span class="badge bg-primary bg-opacity-10 text-primary">
                        {{ sale.items.length }} item{{ sale.items.length !== 1 ? 's' : '' }}
                      </span>
                    </td>
                    <td><strong>{{ formatCurrency(sale.total_price) }}</strong></td>
                    <td><strong>{{ formatCurrency(sale.total_price - sale.total_cost) }}</strong></td>
                    <td class="actions" @click.stop>
                      <NuxtLink
                        :to="`/sells/edit_sell/${sale.id}`"
                        class="btn btn-sm btn-outline-primary"
                        title="Editar"
                      >
                        <i class="bi bi-pencil"></i>
                      </NuxtLink>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        title="Eliminar"
                        data-bs-toggle="modal"
                        :data-bs-target="`#delete-sale-${sale.id}`"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                      <ItemDelete
                        :modal-id="`delete-sale-${sale.id}`"
                        :message="`Estas seguro de eliminar esta venta por ${formatCurrency(sale.total_cost)}?`"
                        @confirm="handleDelete(sale.id)"
                      />
                    </td>
                  </tr>
                  <tr v-if="expanded === sale.id">
                    <td colspan="7" style="padding: 0">
                      <table class="data-table" style="background-color: var(--color-light)">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio unit.</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="item in sale.items" :key="item.id">
                            <td>{{ item.product_name }}</td>
                            <td>{{ item.quantity }}</td>
                            <td>{{ formatCurrency(item.unit_price) }}</td>
                            <td>{{ formatCurrency(item.quantity * item.unit_price) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
            <div v-else class="empty-state">
              <i class="bi bi-inbox"></i>
              <p>No hay ventas registradas</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SaleItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
  unit_cost:number
}

interface Sale {
  id: string
  total_price: number
  total_cost: number
  sold_by_name: string
  created_at: string
  items: SaleItem[]
}

const { apiGet, apiDelete } = useApi()
const { success, error: notifyError } = useNotifications()
const { formatCurrency, formatDate } = useFormatters()
const loading = ref(true)
const sales = ref<Sale[]>([])
const expanded = ref<string | null>(null)

function toggleExpand(saleId: string) {
  expanded.value = expanded.value === saleId ? null : saleId
}

async function fetchSales() {
  loading.value = true
  try {
    const data = await apiGet<{ sales: Sale[] }>('/sales/')
    sales.value = data.sales
  } catch (err) {
    console.error('Error loading sales:', err)
  } finally {
    loading.value = false
  }
}

async function handleDelete(saleId: string) {
  try {
    await apiDelete(`/sales/${saleId}`)
    success('Venta eliminada correctamente')
    fetchSales()
  } catch (err: any) {
    notifyError(err.message || 'Error al eliminar')
  }
}

onMounted(fetchSales)
</script>
