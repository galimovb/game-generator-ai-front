import { defineStore } from 'pinia'

export const useProfileStore = defineStore('profile', () => {
    const { get, patch } = useApi()
    const profile = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const uploading = ref(false)
    const uploadError = ref(null)
    const avatarPreview = ref(null)

    const avatarUrl = computed(() => {
        if (avatarPreview.value) return avatarPreview.value
        if (!profile.value?.avatar) {
            return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
        }
        return `${getPhotoUrl(profile.value.avatar)}`
    })

    const fullName = computed(() => {
        return getUserFullName(profile.value) || '-'
    })

    async function fetchProfile(force = false) {
        if (!force && profile.value) return

        loading.value = true
        error.value = null

        try {
            const response = await get('/users/profile')
            profile.value = response.result
        } catch (err) {
            error.value = err.data?.message || 'Ошибка загрузки профиля'
        } finally {
            loading.value = false
        }
    }

    async function updateProfile(data) {
        loading.value = true
        error.value = null

        try {
            const response = await patch('/users/profile', data)
            profile.value = response.result
            if (data.avatar) {
                avatarPreview.value = null
            }
            return response.result
        } catch (err) {
            error.value = err.data?.message || 'Ошибка обновления профиля'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function uploadAvatar(file) {
        if (!file.type.startsWith('image/')) {
            uploadError.value = 'Можно загружать только изображения'
            return false
        }

        if (file.size > 5 * 1024 * 1024) {
            uploadError.value = 'Размер файла не должен превышать 5MB'
            return false
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = async (e) => {
                const base64 = e.target?.result
                avatarPreview.value = base64
                uploading.value = true
                uploadError.value = null

                try {
                    await updateProfile({ avatar: base64 })
                    resolve(true)
                } catch (err) {
                    uploadError.value = 'Ошибка при загрузке аватара'
                    avatarPreview.value = null
                    reject(err)
                } finally {
                    uploading.value = false
                }
            }

            reader.onerror = () => {
                uploadError.value = 'Ошибка чтения файла'
                reject(new Error('File read error'))
            }

            reader.readAsDataURL(file)
        })
    }

    function getProfileForm() {
        if (!profile.value) {
            return {
                name: '',
                lastName: '',
                middleName: '',
                email: '',
                login: ''
            }
        }

        return {
            name: profile.value.name || '',
            lastName: profile.value.lastName || '',
            middleName: profile.value.middleName || '',
            email: profile.value.email || '',
            login: profile.value.login || ''
        }
    }

    return {
        profile,
        loading,
        error,
        uploading,
        uploadError,
        avatarPreview,
        avatarUrl,
        fullName,
        fetchProfile,
        updateProfile,
        uploadAvatar,
        getProfileForm,
    }
})
