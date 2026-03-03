<template>
  <form @submit.prevent="handleLogin">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        class="form-control"
        placeholder="tu@email.com"
        required
      />
    </div>
    <div class="form-group">
      <label for="password">Contrasena</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        class="form-control"
        placeholder="Tu contrasena"
        required
      />
    </div>
    <p v-if="errorMsg" class="error-message mb-3">{{ errorMsg }}</p>
    <button type="submit" class="btn btn-primary w-100" :disabled="loading">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Iniciar sesion
    </button>
    <button type="button" class="btn btn-secondary w-100 mt-2" :disabled="loading" @click="handleRegister">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Resgistrarse
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  try {
    const { apiPost } = useApi()
    const data = await apiPost<{
      access_token: string
      user: { email: string; username: string; roles: string[] }
    }>('/users/login', form)

    localStorage.setItem('token', data.access_token)

    // Decode token to get expiration
    const payload = JSON.parse(atob(data.access_token.split('.')[1]))
    localStorage.setItem('token_exp', payload.exp.toString())

    userStore.setUser(data.user.email, data.user.username, data.user.roles)
    navigateTo('/users/dashboard')
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al iniciar sesion'
  } finally {
    loading.value = false
  }
}

function handleRegister() {
  navigateTo('/users/register')     
}
</script>
