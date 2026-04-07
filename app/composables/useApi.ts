import { sendRedirect } from 'h3'

export const useApi = () => {
  const { $api } = useNuxtApp()
  let isRefreshing = false
  let refreshPromise: Promise<any> | null = null

  const fetchWithAuth = async (url: string, options: any = {}, currentUrl?: string) => {
    const event = import.meta.server ? useRequestEvent() : null

    const makeRequest = () => $api(url, options)

    try {
      return await makeRequest()
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err
      if (url.includes('/auth/refresh') || url.includes('/login')) throw err

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = $api('/auth/refresh', { method: 'POST' })
            .catch((e) => {
              if (import.meta.server && event) {
                return sendRedirect(event, '/login', 302)
              } else {
                return navigateTo('/login')
              }
              throw e
            })
            .finally(() => {
              isRefreshing = false
              refreshPromise = null
            })
      }

      await refreshPromise

      if (import.meta.client) {
        return await makeRequest()
      } else {
        await sendRedirect(event, currentUrl, 302)
        return
      }
    }
  }

  return {
    get: (url: string, options?: any) => {
      const currentUrl = import.meta.server
          ? useRequestURL().pathname + useRequestURL().search
          : window.location.pathname + window.location.search

      return fetchWithAuth(url, { method: 'GET', ...options }, currentUrl)
    },

    post: (url: string, body?: any, options?: any) => {
      const currentUrl = import.meta.server
          ? useRequestURL().pathname + useRequestURL().search
          : window.location.pathname + window.location.search

      return fetchWithAuth(url, { method: 'POST', body, ...options }, currentUrl)
    },

    put: (url: string, body?: any, options?: any) => {
      const currentUrl = import.meta.server
          ? useRequestURL().pathname + useRequestURL().search
          : window.location.pathname + window.location.search

      return fetchWithAuth(url, { method: 'PUT', body, ...options }, currentUrl)
    },

    patch: (url: string, body?: any, options?: any) => {
      const currentUrl = import.meta.server
          ? useRequestURL().pathname + useRequestURL().search
          : window.location.pathname + window.location.search

      return fetchWithAuth(url, { method: 'PATCH', body, ...options }, currentUrl)
    },

    del: (url: string, options?: any) => {
      const currentUrl = import.meta.server
          ? useRequestURL().pathname + useRequestURL().search
          : window.location.pathname + window.location.search

      return fetchWithAuth(url, { method: 'DELETE', ...options }, currentUrl)
    }
  }
}
