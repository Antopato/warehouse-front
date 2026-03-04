import { useUserStore } from '~/stores/user'

const adminRoutes = [
  '/users/dashboard',
  '/users/analitics',
  '/categories',
  '/products/add_product',
  '/users',
  '/users/register',
]

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('token')
  const publicRoutes = ['/', '/index']

  if (!token && !publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  if (token && publicRoutes.includes(to.path)) {
    const userStore = useUserStore()
    const isAdmin = userStore.roles?.includes('admin') ?? false
    return navigateTo(isAdmin ? '/users/dashboard' : '/products')
  }

  if (token) {
    const userStore = useUserStore()
    const isAdmin = userStore.roles?.includes('admin') ?? false
    if (!isAdmin) {
      const isAdminRoute = adminRoutes.includes(to.path)
        || to.path.startsWith('/products/edit_product')
      if (isAdminRoute) {
        return navigateTo('/products')
      }
    }
  }
})
