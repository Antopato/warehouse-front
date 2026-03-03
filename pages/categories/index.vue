<template>
  <div>
    <!-- Add Category Form -->
    <div class="content-card mb-4">
      <div class="content-card__header">
        <h3 style="font-size: 1rem; margin: 0">
          <i class="bi bi-plus-circle me-2"></i>
          {{ editingId ? 'Editar Categoria' : 'Nueva Categoria' }}
        </h3>
        <button v-if="editingId" class="btn btn-sm btn-secondary" @click="cancelEdit">
          Cancelar
        </button>
      </div>
      <div class="content-card__body">
        <form @submit.prevent="handleSubmit" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label" style="font-size: 0.875rem">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-control"
              placeholder="Nombre de la categoria"
              required
            />
          </div>
          <div class="col-md-5">
            <label class="form-label" style="font-size: 0.875rem">Descripcion</label>
            <input
              v-model="form.description"
              type="text"
              class="form-control"
              placeholder="Descripcion opcional"
            />
          </div>
          <div class="col-md-3">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ editingId ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="content-card">
      <div class="content-card__body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <table v-else-if="categories.length" class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Creada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id">
              <td><strong>{{ cat.name }}</strong></td>
              <td>{{ cat.description || '-' }}</td>
              <td class="text-muted">{{ formatDate(cat.created_at) }}</td>
              <td class="actions">
                <button class="btn btn-sm btn-outline-primary" @click="startEdit(cat)">
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  data-bs-toggle="modal"
                  :data-bs-target="`#delete-cat-${cat.id}`"
                >
                  <i class="bi bi-trash"></i>
                </button>
                <ItemDelete
                  :modal-id="`delete-cat-${cat.id}`"
                  :message="`Estas seguro de eliminar la categoria '${cat.name}'?`"
                  @confirm="handleDelete(cat.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <i class="bi bi-tags"></i>
          <p>No hay categorias registradas</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

const { apiGet, apiPost, apiPut, apiDelete } = useApi()
const { success, error: notifyError } = useNotifications()
const { formatDate } = useFormatters()

const categories = ref<Category[]>([])
const loading = ref(true)
const saving = ref(false)
const editingId = ref<string | null>(null)
const form = reactive({ name: '', description: '' })

async function fetchCategories() {
  loading.value = true
  try {
    const data = await apiGet<{ categories: Category[] }>('/categories/')
    categories.value = data.categories
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  saving.value = true
  try {
    if (editingId.value) {
      await apiPut(`/categories/${editingId.value}`, form)
      success('Categoria actualizada correctamente')
    } else {
      await apiPost('/categories/', form)
      success('Categoria creada correctamente')
    }
    cancelEdit()
    fetchCategories()
  } catch (err: any) {
    notifyError(err.message || 'Error')
  } finally {
    saving.value = false
  }
}

function startEdit(cat: Category) {
  editingId.value = cat.id
  form.name = cat.name
  form.description = cat.description || ''
}

function cancelEdit() {
  editingId.value = null
  form.name = ''
  form.description = ''
}

async function handleDelete(id: string) {
  try {
    await apiDelete(`/categories/${id}`)
    success('Categoria eliminada correctamente')
    fetchCategories()
  } catch (err: any) {
    notifyError(err.message || 'Error al eliminar')
  }
}

onMounted(fetchCategories)
</script>
