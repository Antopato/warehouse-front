<template>
  <div class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['notification-toast', `notification-toast--${notification.type}`]"
    >
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { notifications } = useNotifications()
</script>
