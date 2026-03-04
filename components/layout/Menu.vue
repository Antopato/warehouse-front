<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <i class="bi bi-box-seam" style="font-size: 1.5rem"></i>
      <span class="sidebar__logo">Almacen</span>
    </div>

    <nav class="sidebar__nav">
      <template v-if="isAdmin()">
        <div class="sidebar__section">Principal</div>
        <NuxtLink to="/users/dashboard" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-speedometer2"></i>
          <span>Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/users/analitics" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-bar-chart-line"></i>
          <span>Analiticas</span>
        </NuxtLink>
      </template>

      <NuxtLink to="/sells/sells" class="sidebar__link" active-class="sidebar__link--active">
        <i class="bi bi-cart"></i>
        <span>Ventas</span>
      </NuxtLink>

      <div class="sidebar__section">Inventario</div>
      <NuxtLink to="/products" class="sidebar__link" active-class="sidebar__link--active">
        <i class="bi bi-box"></i>
        <span>Productos</span>
      </NuxtLink>
      <template v-if="isAdmin()">
        <NuxtLink to="/products/add_product" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-plus-circle"></i>
          <span>Nuevo Producto</span>
        </NuxtLink>
        <NuxtLink to="/categories" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-tags"></i>
          <span>Categorias</span>
        </NuxtLink>

        <div class="sidebar__section">Administracion</div>
        <NuxtLink to="/users" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-people"></i>
          <span>Usuarios</span>
        </NuxtLink>
        <NuxtLink to="/users/register" class="sidebar__link" active-class="sidebar__link--active">
          <i class="bi bi-person-plus"></i>
          <span>Nuevo Usuario</span>
        </NuxtLink>
      </template>
    </nav>

    <div class="sidebar__footer">
      <a href="#" class="sidebar__link" @click.prevent="handleLogout">
        <i class="bi bi-box-arrow-left"></i>
        <span>Cerrar sesion</span>
      </a>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/user'

const { isAdmin } = usePermissions()
const { doLogout } = useApi()
const userStore = useUserStore()

function handleLogout() {
  userStore.clearUser()
  doLogout()
}
</script>
