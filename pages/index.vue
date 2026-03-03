<template>
  <div class="auth-card">
    <div class="auth-card__logo">
      <i class="bi bi-box-seam"></i>
      <h1>Almacen</h1>
      <p>Gestion de inventario</p>
    </div>

    <UsersUserLogin />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})
</script>
