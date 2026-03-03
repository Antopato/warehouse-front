<template>
  <header class="main-content__header">
    <h1 class="page-title">{{ pageTitle }}</h1>
    <div class="d-flex align-items-center gap-3">
      <span class="text-muted" style="font-size: 0.875rem">
        <i class="bi bi-person-circle me-1"></i>
        {{ userStore.username || userStore.email }}
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const route = useRoute()

const pageTitles: Record<string, string> = {
  '/users/dashboard': 'Dashboard',
  '/users/analitics': 'Analiticas',
  '/sells/sells': 'Ventas',
  '/sells/add': 'Nueva Venta',
  '/products': 'Productos',
  '/products/add_product': 'Nuevo Producto',
  '/categories': 'Categorias',
  '/users': 'Usuarios',
  '/users/register': 'Registrar Usuario',
}

const pageTitle = computed(() => {
  if (route.path.startsWith('/products/edit_product')) return 'Editar Producto'
  return pageTitles[route.path] || 'Almacen'
})
</script>
