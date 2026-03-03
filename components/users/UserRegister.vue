<template>
    <form @submit.prevent="handleRegister">
       <div class="form-group">
         <label for="reg-username">Nombre de usuario</label>
         <input
           id="reg-username"
           v-model="form.username"
           type="text"
           class="form-control"
           placeholder="Tu nombre de usuario"
           required
         />
       </div>
       <div class="form-group">
         <label for="reg-email">Email</label>
         <input
           id="reg-email"
           v-model="form.email"
           type="email"
           class="form-control"
           placeholder="tu@email.com"
           required
         />
       </div>
       <div class="form-group">
         <label for="reg-password">Contrasena</label>
         <input
           id="reg-password"
           v-model="form.password"
           type="password"
           class="form-control"
           placeholder="Minimo 6 caracteres"
           minlength="6"
           required
         />
       </div>
       <p v-if="errorMsg" class="error-message mb-3">{{ errorMsg }}</p>
       <button type="submit" class="btn btn-primary w-100" :disabled="saving">
         <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
         Registrarse
       </button>
       <button type="button" class="btn btn-secondary w-100 mt-2" :disabled="saving" @click="goToLogin">
         Volver al login
       </button>
     </form>
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

   async function handleRegister() {
     saving.value = true
     errorMsg.value = ''
     try {
       await apiPost('/users/register', form)
       success('Usuario registrado correctamente')
       navigateTo('/')
     } catch (err: any) {
       errorMsg.value = err.message || 'Error al registrar'
       notifyError(errorMsg.value)
     } finally {
       saving.value = false
     }
   }

   function goToLogin() {
     navigateTo('/')
   }
</script>