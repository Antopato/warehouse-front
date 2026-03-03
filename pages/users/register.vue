<template>
  <div class="content-card" style="max-width: 600px">
    <div class="content-card__body">
      <div class="form-header">
        <h2>Registrar Usuario</h2>
        <p class="text-muted">Crea una nueva cuenta de usuario para el sistema</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Nombre de usuario *</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-control"
            placeholder="Nombre completo"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="usuario@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contrasena *</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="Minimo 6 caracteres"
            minlength="6"
            required
          />
        </div>

        <div class="form-group">
          <label>Roles *</label>
          <div class="d-flex gap-3 mt-1">
            <div class="form-check">
              <input
                id="role-worker"
                v-model="form.roles"
                type="checkbox"
                class="form-check-input"
                value="worker"
              />
              <label class="form-check-label" for="role-worker">Trabajador</label>
            </div>
            <div class="form-check">
              <input
                id="role-manager"
                v-model="form.roles"
                type="checkbox"
                class="form-check-input"
                value="manager"
              />
              <label class="form-check-label" for="role-manager">Gestor</label>
            </div>
            <div class="form-check">
              <input
                id="role-admin"
                v-model="form.roles"
                type="checkbox"
                class="form-check-input"
                value="admin"
              />
              <label class="form-check-label" for="role-admin">Administrador</label>
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

        <div class="form-actions">
          <NuxtLink to="/users" class="btn btn-secondary">Cancelar</NuxtLink>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            Registrar Usuario
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const { apiPost } = useApi()
const { success, error: notifyError } = useNotifications()

const saving = ref(false)
const errorMsg = ref('')
const form = reactive({
  username: '',
  email: '',
  password: '',
  roles: ['worker'] as string[],
})

async function handleSubmit() {
  if (!form.roles.length) {
    errorMsg.value = 'Selecciona al menos un rol'
    return
  }
  saving.value = true
  errorMsg.value = ''
  try {
    await apiPost('/users/register', form)
    success('Usuario registrado correctamente')
    navigateTo('/users')
  } catch (err: any) {
    errorMsg.value = err.message || 'Error al registrar'
    notifyError(errorMsg.value)
  } finally {
    saving.value = false
  }
}
</script>
