<template>
  <div class="content-card" style="max-width: 800px">
    <div class="content-card__body centered-form">
      <div class="form-header">
        <h2>Nueva Venta</h2>
        <p class="text-muted">Registra una nueva venta</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Product Selector -->
        <div class="form-group">
          <label for="product-select">Añadir producto</label>
          <select
            id="product-select"
            v-model="selectedProductId"
            class="form-select"
            @change="addProduct"
          >
            <option value="">Seleccionar producto...</option>
            <option v-for="product in availableProducts" :key="product.id" :value="product.id">
              {{ product.name }} — {{ formatCurrency(product.price) }}
            </option>
          </select>
        </div>

        <!-- Items Table -->
        <div class="form-group">
          <table v-if="items.length" class="data-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th style="width: 120px">Cantidad</th>
                <th>Precio unit.</th>
                <th>Subtotal</th>
                <th style="width: 50px"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="item.product_id">
                <td>{{ item.product_name }}</td>
                <td>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    class="form-control form-control-sm"
                    min="1"
                    required
                  />
                </td>
                <td>{{ formatCurrency(item.unit_price) }}</td>
                <td><strong>{{ formatCurrency(item.quantity * item.unit_price) }}</strong></td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeItem(index)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-end"><strong>Total:</strong></td>
                <td><strong style="margin-left: 5px;">{{ formatCurrency(total) }}</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          <div v-else class="empty-state">
            <i class="bi bi-cart"></i>
            <p>Añade productos a la venta</p>
          </div>
        </div>

        <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

        <div class="form-actions">
          <NuxtLink to="/sells" class="btn btn-secondary">Cancelar</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="saving || !items.length">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            Guardar Venta
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Product {
  id: string
  name: string
  price: number
  cost: number
}

interface SaleItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  unit_cost: number
}

const { apiGet, apiPost } = useApi()
const { success, error: notifyError } = useNotifications()
const { formatCurrency } = useFormatters()

const products = ref<Product[]>([])
const items = ref<SaleItem[]>([])
const selectedProductId = ref('')
const saving = ref(false)
const errorMsg = ref('')

const availableProducts = computed(() =>
  products.value.filter((p) => !items.value.some((item) => item.product_id === p.id))
)

const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
)

function addProduct() {
  const product = products.value.find((p) => p.id === selectedProductId.value)
  if (!product) return
  items.value.push({
    product_id: product.id,
    product_name: product.name,
    quantity: 1,
    unit_price: product.price,
    unit_cost: product.cost,
  })
  selectedProductId.value = ''
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

async function handleSubmit() {
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      items: items.value.map(({ product_id, quantity, unit_price, unit_cost }) => ({
        product_id,
        quantity,
        unit_price,
        unit_cost,
      })),
    }
    await apiPost('/sales/', payload)
    success('Venta registrada correctamente')
    navigateTo('/sells/sells')
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al registrar venta'
    notifyError(errorMsg.value)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await apiGet<{ products: Product[] }>('/products/')
    products.value = data.products
  } catch (err) {
    console.error(err)
  }
})
</script>
