export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const token = localStorage.getItem('token')
  const publicRoutes = ['/', '/index', '/users/register']

  if (!token && !publicRoutes.includes(to.path)) {
    return navigateTo('/')
  }

  if (token && publicRoutes.includes(to.path)) {
    return navigateTo('/users/dashboard')
  }
})
