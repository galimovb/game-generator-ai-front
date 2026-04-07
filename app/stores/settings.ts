import type { UserSettings } from '~/types/user'

export const useSettingsStore = defineStore('settings', () => {
    const { get, patch } = useApi()

    const states = reactive({
        settings: {
            generationModel: 'qwen/qwen2.5-vl-7b-instruct',
            generationCreative: 0.7
        } as UserSettings,
        loading: false as boolean,
        error: null as string | null
    })

    async function fetchSettings() {
        states.loading = true
        states.error = null
        try {
            const { result } = await get('/users/profile/settings')
            states.settings = result
        } catch (err: any) {
            states.error = err.data?.message || 'Ошибка загрузки'
        } finally {
            states.loading = false
        }
    }

    async function updateSettings(data: Partial<typeof state.settings>) {
        if(states.loading) return

        states.loading = true
        states.error = null
        try {
            const { result } = await patch('/users/profile/settings', data)
            Object.assign(states.settings, result)
        } catch (err: any) {
            states.error = err.data?.message || 'Ошибка сохранения'
            throw err
        } finally {
            states.loading = false
        }
    }

    return {
        states,
        fetchSettings,
        updateSettings
    }
})
