import { useUserStore } from '~/stores/user'

export function usePermissions() {
  const userStore = useUserStore()

  function hasRole(role: string): boolean {
    return userStore.roles?.includes(role) ?? false
  }

  function isAdmin(): boolean {
    return hasRole('admin')
  }

  function isManager(): boolean {
    return hasRole('manager')
  }

  function canManageUsers(): boolean {
    return isAdmin()
  }

  function canManageProducts(): boolean {
    return isAdmin() || isManager()
  }

  return { hasRole, isAdmin, isManager, canManageUsers, canManageProducts }
}
