export function useAutoLogout() {
  let intervalId: ReturnType<typeof setInterval> | null = null

  function start() {
    if (intervalId) return
    intervalId = setInterval(() => {
      const tokenExp = localStorage.getItem('token_exp')
      if (!tokenExp) return

      const expTime = parseInt(tokenExp, 10) * 1000
      const now = Date.now()
      const remaining = expTime - now

      if (remaining < 2 * 60 * 1000 && remaining > 0) {
        const { doLogout } = useApi()
        const config = useRuntimeConfig()
        const apiBase = config.public.apiBase as string
        const token = localStorage.getItem('token')

        fetch(`${apiBase}/users/token/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        })
          .then((res) => {
            if (res.ok) return res.json()
            throw new Error('Refresh failed')
          })
          .then((data) => {
            localStorage.setItem('token', data.access_token)
          })
          .catch(() => {
            doLogout()
          })
      }
    }, 30000)
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  return { start, stop }
}
