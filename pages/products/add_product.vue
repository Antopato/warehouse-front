<template>
  <div class="content-card" style="max-width: 700px; margin: 0 auto">
    <div class="content-card__body">
      <div class="form-header">
        <h2>Nuevo Producto</h2>
        <p class="text-muted">Registra un nuevo producto en el almacen</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group">
              <label for="code">Codigo *</label>
              <input
                id="code"
                v-model="form.code"
                type="text"
                class="form-control"
                placeholder="PRD-001"
                required
              />
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label for="name">Nombre *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                class="form-control"
                placeholder="Nombre del producto"
                required
              />
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
            placeholder="Descripcion del producto"
          ></textarea>
        </div>

        <div class="row">
          <div class="col-md-4">
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
          <div class="col-md-4">
            <div class="form-group">
              <label for="quantity">Cantidad *</label>
              <input
                id="quantity"
                v-model.number="form.quantity"
                type="number"
                class="form-control"
                min="0"
                required
              />
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-4">
            <div class="form-group">
              <label for="price">Precio Venta*</label>
              <input
                id="price"
                v-model.number="form.price"
                type="number"
                step="0.01"
                class="form-control"
                min="0"
                required
              />
            </div>
          </div>

          <div class="col-md-4">
            <div class="form-group">
              <label for="cost">Coste*</label>
              <input
                id="cost"
                v-model.number="form.cost"
                type="number"
                step="0.01"
                class="form-control"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="location">Ubicacion</label>
          <input
            id="location"
            v-model="form.location"
            type="text"
            class="form-control"
            placeholder="Ej: Estanteria A3, Pasillo 2"
          />
        </div>

        <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

        <div class="form-actions">
          <NuxtLink to="/products" class="btn btn-secondary">Cancelar</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Category {
  id: string
  name: string
}

const { apiGet, apiPost } = useApi()
const { success, error: notifyError } = useNotifications()

const categories = ref<Category[]>([])
const saving = ref(false)
const errorMsg = ref('')
const form = reactive({
  code: '',
  name: '',
  description: '',
  category_id: '',
  quantity: 0,
  price: 0,
  cost:0,
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
    await apiPost('/products/', payload)
    success('Producto creado correctamente')
    navigateTo('/products')
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al crear producto'
    notifyError(errorMsg.value)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await apiGet<{ categories: Category[] }>('/categories/')
    categories.value = data.categories
  } catch (err) {
    console.error(err)
  }
})
</script>
