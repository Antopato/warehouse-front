<template>
  <div>
    <div class="content-card">
      <div class="content-card__header">
        <h3 style="font-size: 1rem; margin: 0">
          <i class="bi bi-people me-2"></i>
          Listado de Usuarios
        </h3>
        <NuxtLink to="/users/register" class="btn btn-primary btn-sm btn-icon">
          <i class="bi bi-person-plus"></i>
          Nuevo
        </NuxtLink>
      </div>
      <div class="content-card__body">
        <div v-if="loading" class="loading-spinner">
          <div class="spinner-border text-primary"></div>
        </div>

        <table v-else-if="users.length" class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td><strong>{{ user.username }}</strong></td>
              <td>{{ user.email }}</td>
              <td>
                <span
                  v-for="role in user.roles"
                  :key="role"
                  class="badge me-1"
                  :class="roleBadgeClass(role)"
                >
                  {{ role }}
                </span>
              </td>
              <td class="text-muted">{{ formatDate(user.created_at) }}</td>
              <td class="actions">
                <button
                  class="btn btn-sm btn-outline-danger"
                  data-bs-toggle="modal"
                  :data-bs-target="`#delete-user-${user.id}`"
                >
                  <i class="bi bi-trash"></i>
                </button>
                <ItemDelete
                  :modal-id="`delete-user-${user.id}`"
                  :message="`Estas seguro de eliminar al usuario '${user.username}'?`"
                  @confirm="handleDelete(user.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          <i class="bi bi-people"></i>
          <p>No hay usuarios registrados</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface UserItem {
  id: string
  email: string
  username: string
  roles: string[]
  created_at: string
}

const { apiGet, apiDelete } = useApi()
const { success, error: notifyError } = useNotifications()
const { formatDate } = useFormatters()

const users = ref<UserItem[]>([])
const loading = ref(true)

async function fetchUsers() {
  loading.value = true
  try {
    const data = await apiGet<{ users: UserItem[] }>('/users/')
    users.value = data.users
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function handleDelete(userId: string) {
  try {
    await apiDelete(`/users/${userId}`)
    success('Usuario eliminado correctamente')
    fetchUsers()
  } catch (err: any) {
    notifyError(err.message || 'Error al eliminar')
  }
}

function roleBadgeClass(role: string): string {
  const map: Record<string, string> = {
    admin: 'bg-danger',
    manager: 'bg-primary',
    worker: 'bg-secondary',
  }
  return map[role] || 'bg-secondary'
}

onMounted(fetchUsers)
</script>
