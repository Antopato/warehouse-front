export function useApi() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase as string

  async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token')

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${apiBase}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (response.status === 401) {
      const refreshed = await tryRefreshToken()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`
        const retryResponse = await fetch(`${apiBase}${url}`, {
          ...options,
          headers,
          credentials: 'include',
        })
        if (!retryResponse.ok) {
          throw new Error(`Error ${retryResponse.status}`)
        }
        return retryResponse.json()
      } else {
        doLogout()
        throw new Error('Sesión expirada')
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `Error ${response.status}`)
    }

    return response.json()
  }

  async function tryRefreshToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiBase}/users/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.access_token)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  function doLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('token_exp')
    navigateTo('/')
  }

  async function apiGet<T>(url: string): Promise<T> {
    return apiFetch<T>(url, { method: 'GET' })
  }

  async function apiPost<T>(url: string, body?: unknown): Promise<T> {
    return apiFetch<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async function apiPut<T>(url: string, body?: unknown): Promise<T> {
    return apiFetch<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async function apiDelete<T>(url: string): Promise<T> {
    return apiFetch<T>(url, { method: 'DELETE' })
  }

  return { apiFetch, apiGet, apiPost, apiPut, apiDelete, doLogout }
}
