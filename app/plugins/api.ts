import { appendResponseHeader } from 'h3'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const API_BASE = `${config.public.apiBase}/api`
    const headers = import.meta.server ? useRequestHeaders(['cookie']) : {}
    const event = import.meta.server ? useRequestEvent() : undefined

    const api = $fetch.create({
        baseURL: API_BASE,
        credentials: 'include',
        headers: import.meta.server ? headers : {},

        async onResponse(ctx) {
            if (import.meta.server && event) {
                const cookies = ctx.response.headers.getSetCookie?.()

                if (cookies?.length) {
                    for (const cookie of cookies) {
                        appendResponseHeader(event, 'set-cookie', cookie)
                    }
                }
            }
        }
    })

    return {
        provide: { api }
    }
})
