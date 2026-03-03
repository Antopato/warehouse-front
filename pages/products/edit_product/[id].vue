<template>
  <div class="content-card" style="max-width: 700px">
    <div class="content-card__body">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner-border text-primary"></div>
      </div>

      <template v-else>
        <div class="form-header">
          <h2>Editar Producto</h2>
          <p class="text-muted">Codigo: <strong>{{ productCode }}</strong></p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  required
                />
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="category">Categoria</label>
                <select id="category" v-model="form.category_id" class="form-select">
                  <option value="">Sin categoria</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descripcion</label>
            <textarea
              id="description"
              v-model="form.description"
              class="form-control"
              rows="3"
            ></textarea>
          </div>

          <div class="row">
            <div class="col-md-4">
              <div class="form-group">
                <label for="quantity">Cantidad</label>
                <input
                  id="quantity"
                  v-model.number="form.quantity"
                  type="number"
                  class="form-control"
                  min="0"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="price">Precio</label>
                <input
                  id="price"
                  v-model.number="form.price"
                  type="number"
                  step="0.01"
                  class="form-control"
                  min="0"
                />
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <label for="location">Ubicacion</label>
                <input
                  id="location"
                  v-model="form.location"
                  type="text"
                  class="form-control"
                />
              </div>
            </div>
          </div>

          <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

          <div class="form-actions">
            <NuxtLink to="/products" class="btn btn-secondary">Cancelar</NuxtLink>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Guardar Cambios
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Category {
  id: string
  name: string
}

const route = useRoute()
const { apiGet, apiPut } = useApi()
const { success, error: notifyError } = useNotifications()

const loading = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const productCode = ref('')
const categories = ref<Category[]>([])
const form = reactive({
  name: '',
  description: '',
  category_id: '',
  quantity: 0,
  price: 0,
  location: '',
})

async function handleSubmit() {
  saving.value = true
  errorMsg.value = ''
  try {
    const payload = {
      ...form,
      category_id: form.category_id || null,
    }
    await apiPut(`/products/${route.params.id}`, payload)
    success('Producto actualizado correctamente')
    navigateTo('/products')
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al actualizar'
    notifyError(errorMsg.value)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const [productData, categoriesData] = await Promise.all([
      apiGet<any>(`/products/${route.params.id}`),
      apiGet<{ categories: Category[] }>('/categories/'),
    ])
    productCode.value = productData.code
    form.name = productData.name
    form.description = productData.description || ''
    form.category_id = productData.category_id || ''
    form.quantity = productData.quantity
    form.price = productData.price
    form.location = productData.location || ''
    categories.value = categoriesData.categories
  } catch (err) {
    console.error(err)
    notifyError('Error al cargar el producto')
  } finally {
    loading.value = false
  }
})
</script>
