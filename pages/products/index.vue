<template>
  <div>
    <!-- Filters -->
    <div class="content-card mb-4">
      <div class="content-card__body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label" style="font-size: 0.875rem">Buscar</label>
            <input
              v-model="search"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre o codigo..."
              @input="debouncedFetch"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label" style="font-size: 0.875rem">Categoria</label>
            <select v-model="selectedCategory" class="form-select" @change="currentPage=1;fetchProducts()">
              <option value="">Todas</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <NuxtLink to="/products/add_product" class="btn btn-primary btn-icon">
              <i class="bi bi-plus-circle"></i>
              Nuevo Producto
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Products Table -->
    <div class="content-card">
      <div class="content-card__body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>
        <table v-else-if="products.length" class="data-table">
          <thead>
            <tr>
              <th>Codigo</th>
              <th>Nombre</th>
              <th>Categoria</th>
              <th style="cursor: pointer; user-select: none" @click="toggleStockOrder">
                Stock
                <i v-if="orderBy === 'stock_asc'" class="bi bi-arrow-up"></i>
                <i v-else-if="orderBy === 'stock_desc'" class="bi bi-arrow-down"></i>
              </th>
              <th>Precio Venta</th>
              <th>Coste</th>
              <th>Ubicacion</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id">
              <td><strong>{{ product.code }}</strong></td>
              <td>{{ product.name }}</td>
              <td>{{ product.category_name || '-' }}</td>
              <td>
                <span :class="stockBadgeClass(product.quantity)">
                  {{ product.quantity }}
                </span>
              </td>
              <td>{{ formatCurrency(product.price) }}</td>
              <td>{{ formatCurrency(product.cost) }}</td>
              <td>{{ product.location || '-' }}</td>
              <td class="actions">
                <NuxtLink
                  :to="`/products/edit_product/${product.id}`"
                  class="btn btn-sm btn-outline-primary"
                  title="Editar"
                >
                  <i class="bi bi-pencil"></i>
                </NuxtLink>
                <button
                  class="btn btn-sm btn-outline-danger"
                  title="Eliminar"
                  data-bs-toggle="modal"
                  :data-bs-target="`#delete-${product.id}`"
                >
                  <i class="bi bi-trash"></i>
                </button>
                <ItemDelete
                  :modal-id="`delete-${product.id}`"
                  :message="`Estas seguro de eliminar el producto '${product.name}'?`"
                  @confirm="handleDelete(product.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <nav v-if="totalPages > 1" class="mt-3">
          <ul class="pagination justify-content-end">
            <!-- Botón "Anterior" -->
            <li :class="['page-item', { disabled: currentPage === 1 }]">
              <button class="page-link" @click="goToPage(currentPage - 1)">
                Anterior
              </button>
            </li>

            <!-- Números de página -->
            <li
              v-for="page in totalPages"
              :key="page"
              :class="['page-item', { active: page === currentPage }]"
            >
              <button class="page-link" @click="goToPage(page)">
                {{ page }}
              </button>
            </li>

            <!-- Botón "Siguiente" -->
            <li :class="['page-item', { disabled: currentPage === totalPages }]">
              <button class="page-link" @click="goToPage(currentPage + 1)">
                Siguiente
              </button>
            </li>
          </ul>
        </nav>

        <div v-if="!loading && !products.length" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>No se encontraron productos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: string
  code: string
  name: string
  category_name: string | null
  quantity: number
  cost:number
  price: number
  location: string | null
}

interface Category {
  id: string
  name: string
}

const { apiGet, apiDelete } = useApi()
const { success, error } = useNotifications()
const { formatCurrency } = useFormatters()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalProducts = ref(0)
const orderBy = ref('')

let debounceTimer: ReturnType<typeof setTimeout>

function debouncedFetch() {
  currentPage.value = 1
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchProducts, 300)
}

async function fetchProducts() {
  loading.value = true
  try {
    let url = '/products/?'
    if (search.value) url += `search=${encodeURIComponent(search.value)}&`
    if (selectedCategory.value) url += `category_id=${selectedCategory.value}&`
    if (orderBy.value) url += `order_by=${orderBy.value}&`
    url += `page=${currentPage.value}&page_size=${pageSize.value}`
    const data = await apiGet<{ products: Product[]; total_pages: number; total: number }>(url)
    products.value = data.products
    totalPages.value = data.total_pages
    totalProducts.value = data.total
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    const data = await apiGet<{ categories: Category[] }>('/categories/')
    categories.value = data.categories
  } catch (err) {
    console.error(err)
  }
}

async function handleDelete(productId: string) {
  try {
    await apiDelete(`/products/${productId}`)
    success('Producto eliminado correctamente')
    fetchProducts()
  } catch (err: any) {
    error(err.message || 'Error al eliminar')
  }
}

function toggleStockOrder() {
  if (orderBy.value === '') orderBy.value = 'stock_asc'
  else if (orderBy.value === 'stock_asc') orderBy.value = 'stock_desc'
  else orderBy.value = ''
  currentPage.value = 1
  fetchProducts()
}

function goToPage(page: number) {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    fetchProducts()
  }

function stockBadgeClass(qty: number): string {
  if (qty === 0) return 'badge-stock badge-stock--critical'
  if (qty <= 10) return 'badge-stock badge-stock--low'
  return 'badge-stock badge-stock--ok'
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>
