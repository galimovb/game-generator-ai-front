import { sendRedirect } from 'h3'

export const useApi = () => {
  const { $api } = useNuxtApp()

  const fetchWithAuth = async (url: string, options: any = {}, currentUrl?: string) => {
    const event = import.meta.server ? useRequestEvent() : null

    try {
      return await $api(url, options)
    } catch (err: any) {
      if (err?.response?.status !== 401) throw err
      if (url.includes('/auth/refresh')) throw err

      try {
        await $api('/auth/refresh', {
          method: 'POST'
        })

        if (import.meta.client) {
          return await $api(url, options)
        } else {
          await sendRedirect(event, currentUrl || '/login', 302)
          return
        }
      } catch (e) {
        if (import.meta.server && event) {
          await sendRedirect(event, '/login', 302)
        } else {
          await navigateTo('/login')
        }
        throw e
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
