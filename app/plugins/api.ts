import { appendResponseHeader } from 'h3'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()
    const API_BASE = `${config.public.apiBase}/api`

    const api = $fetch.create({
        baseURL: API_BASE,
        credentials: 'include',

        async onRequest(ctx) {
            if (import.meta.server) {
                ctx.options.headers = {
                    ...ctx.options.headers,
                    ...useRequestHeaders(['cookie'])
                }
                ;(ctx as any)._event = useRequestEvent()
            }
        },

        async onResponse(ctx) {
            if (import.meta.server) {
                const event = (ctx as any)._event
                const cookies = ctx.response.headers.getSetCookie?.()
                if (cookies?.length) {
                    for (const cookie of cookies) {
                        appendResponseHeader(event, 'set-cookie', cookie)
                    }
                }
            }
        },

        async onResponseError(ctx) {
            if (ctx.response.status !== 401) return
            if (ctx.request.toString().includes('/auth/refresh')) return

            const originalRequest = ctx.request
            const originalOptions = ctx.options
            const event = (ctx as any)._event

            try {
                // Обновляем токен
                const refreshResponse = await nuxtApp.runWithContext(async () => {
                    return await $fetch.raw('/auth/refresh', {
                        baseURL: API_BASE,
                        method: 'POST',
                        credentials: 'include',
                        headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
                    })
                })

                // Пробрасываем cookies на сервере
                if (import.meta.server && event) {
                    const refreshCookies = refreshResponse.headers.getSetCookie?.()
                    if (refreshCookies?.length) {
                        for (const cookie of refreshCookies) {
                            appendResponseHeader(event, 'set-cookie', cookie)
                        }
                    }
                }

                if (import.meta.client) {
                    return await nuxtApp.runWithContext(async () => {
                        return await $fetch(originalRequest, {
                            ...originalOptions,
                            baseURL: API_BASE,
                            credentials: 'include',
                            headers: import.meta.server ? useRequestHeaders(['cookie']) : {}
                        })
                    })
                }

            } catch (e) {
                if (import.meta.client) {
                    await nuxtApp.runWithContext(async () => {
                        await navigateTo('/login')
                    })
                }
                throw e
            }
        }
    })

    return {
        provide: { api }
    }
})
