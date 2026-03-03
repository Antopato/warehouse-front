import { defineStore } from 'pinia'

interface UserState {
  email: string | null
  username: string | null
  roles: string[] | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    email: null,
    username: null,
    roles: null,
  }),
  getters: {
    isAdmin: (state) => state.roles?.includes('admin') ?? false,
    isManager: (state) => state.roles?.includes('manager') ?? false,
  },
  actions: {
    setUser(email: string, username: string, roles: string[]) {
      this.email = email
      this.username = username
      this.roles = roles
    },
    clearUser() {
      this.email = null
      this.username = null
      this.roles = null
    },
  },
  persist: true,
})
