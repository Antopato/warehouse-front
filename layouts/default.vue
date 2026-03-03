<template>
  <div class="app-layout">
    <LayoutMenu />
    <div class="main-content">
      <LayoutHeader />
      <div class="main-content__body">
        <NotificationToasts />
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { start, stop } = useAutoLogout()

onMounted(() => {
  start()
})

onUnmounted(() => {
  stop()
})
</script>

<style>
@import 'bootstrap/dist/css/bootstrap.min.css';
@import '~/assets/css/main.css';
</style>
