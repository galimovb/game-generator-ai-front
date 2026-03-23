import { defineStore } from 'pinia'
import type { UserProfile } from '~/types/user'

export const useProfileStore = defineStore('profile', () => {
    const { get, patch } = useApi()

    const profile = ref<UserProfile | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const uploading = ref(false)

    const avatarUrl = computed(() => {
        if (!profile.value?.avatar) {
            return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
        }
        return getPhotoUrl(profile.value.avatar)
    })

    const fullName = computed(() => {
        return getUserFullName(profile.value)
    })

    async function fetchProfile() {
        loading.value = true
        error.value = null

        try {
            const response = await get('/users/profile')
            profile.value = response.result
        } catch (err: any) {
            error.value = err.data?.message || 'Ошибка загрузки профиля'
        } finally {
            loading.value = false
        }
    }

    async function updateProfile(data: Partial<UserProfile>) {
        loading.value = true
        error.value = null

        try {
            const response = await patch('/users/profile', data)
            profile.value = response.result
        } catch (err: any) {
            error.value = err.data?.message || 'Ошибка обновления профиля'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function uploadAvatar(file: File) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Можно загружать только изображения')
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new Error('Размер файла не должен превышать 5MB')
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = async (e) => {
                uploading.value = true
                try {
                    await updateProfile({ avatar: e.target?.result as string })
                    resolve(true)
                } catch (err) {
                    reject(err)
                } finally {
                    uploading.value = false
                }
            }

            reader.onerror = () => reject(new Error('Ошибка чтения файла'))
            reader.readAsDataURL(file)
        })
    }

    async function logout() {
        const { post } = useApi()
        try {
            await post('/auth/logout')
            profile.value = null
            navigateTo('/login')
        } catch (e) {
            console.error('Ошибка выхода', e)
        }
    }

    return {
        profile,
        loading,
        error,
        uploading,
        avatarUrl,
        fullName,
        fetchProfile,
        updateProfile,
        uploadAvatar,
        logout
    }
})
