<script setup lang="ts">
import { ref } from 'vue'
import { Camera, Loader } from 'lucide-vue-next'
import type { UserProfile } from "../../types/user";

const { get, patch } = useApi()
const config = useRuntimeConfig()

// Состояние редактирования
const isEditing = ref(false)
const editForm = ref({
  name: '',
  lastName: '',
  middleName: '',
  email: '',
  login: ''
})

// Получаем данные профиля
const { data: profile } = await useAsyncData<{ result: UserProfile }>('profile', () =>
    get('/users/profile')
)

// Инициализация формы при загрузке данных
watchEffect(() => {
  if (profile.value?.result) {
    editForm.value = {
      name: profile.value.result.name || '',
      lastName: profile.value.result.lastName || '',
      middleName: profile.value.result.middleName || '',
      email: profile.value.result.email || '',
      login: profile.value.result.login || ''
    }
  }
})

// Состояние для загрузки аватара
const uploading = ref(false)
const uploadError = ref('')
const avatarPreview = ref<string | null>(null)

// Обработка выбора файла
const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  const file = input.files[0]

  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Можно загружать только изображения'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Размер файла не должен превышать 5MB'
    return
  }

  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string
    avatarPreview.value = base64
    uploading.value = true
    uploadError.value = ''

    try {
      const response = await patch('/users/profile', { avatar: base64 })
      profile.value.result = response.result
      avatarPreview.value = null
    } catch (err: any) {
      uploadError.value = err.data?.message || 'Ошибка при загрузке аватара'
    } finally {
      uploading.value = false
      input.value = ''
    }
  }
  reader.readAsDataURL(file)
}

// Сохранение изменений
const saveChanges = async () => {
  try {
    const response = await patch('/users/profile', editForm.value)
    profile.value.result = response.result
    isEditing.value = false
  } catch (err: any) {
    console.error('Ошибка сохранения:', err)
  }
}

// Отмена редактирования
const cancelEdit = () => {
  if (profile.value?.result) {
    editForm.value = {
      name: profile.value.result.name || '',
      lastName: profile.value.result.lastName || '',
      middleName: profile.value.result.middleName || '',
      email: profile.value.result.email || '',
      login: profile.value.result.login || ''
    }
  }
  isEditing.value = false
}

// URL аватара
const avatarUrl = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  return profile.value?.result?.avatar
      ? `${config.public.apiBase}${profile.value.result.avatar}`
      : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
})
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div class="border rounded-lg p-6">
      <div class="flex gap-8">
        <!-- Аватар -->
        <div class="w-48 flex-shrink-0">
          <div class="relative">
            <div class="w-48 h-48 rounded-lg overflow-hidden border bg-gray-50">
              <img
                  :src="avatarUrl"
                  :alt="profile?.result?.name || 'Avatar'"
                  class="w-full h-full object-cover"
              >
              <div
                  v-if="uploading"
                  class="absolute inset-0 bg-black/50 flex items-center justify-center"
              >
                <Loader class="w-8 h-8 animate-spin text-white" />
              </div>
            </div>

            <label class="absolute -bottom-2 -right-2 cursor-pointer">
              <div class="bg-blue-600 text-white rounded-full p-2.5 shadow-lg hover:bg-blue-700 transition-colors">
                <Camera class="w-5 h-5" />
              </div>
              <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarSelect"
                  :disabled="uploading"
              >
            </label>
          </div>
          <p v-if="uploadError" class="text-sm text-red-500 mt-2">{{ uploadError }}</p>
          <p class="text-xs text-gray-500 mt-2">JPG, PNG, GIF до 5MB</p>
        </div>

        <!-- Данные профиля -->
        <div class="flex-1 space-y-2">
          <div class="flex justify-between">
            <h1 class="font-semibold">
              Профиль
            </h1>
            <Button
                v-if="!isEditing"
                @click="isEditing = true"
                variant="link"
            >
              Изменить
            </Button>
          </div>

          <div class="space-y-4">
            <!-- Имя -->
            <div>
              <Label>Имя</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.result?.name || '—' }}</div>
              <input
                  v-else
                  v-model="editForm.name"
                  type="text"
                  placeholder="Имя"
                  class="w-full px-3 py-2 border rounded-md"
              >
            </div>

            <!-- Фамилия -->
            <div>
              <Label>Фамилия</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.result?.lastName || '—' }}</div>
              <input
                  v-else
                  v-model="editForm.lastName"
                  type="text"
                  placeholder="Фамилия"
                  class="w-full px-3 py-2 border rounded-md"
              >
            </div>

            <!-- Отчество -->
            <div>
              <Label>Отчество</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.result?.middleName || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.middleName"
                  type="text"
                  placeholder="Отчество"
              />
            </div>

            <!-- Почта -->
            <div>
              <Label>Почта</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.result?.email || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.email"
                  type="email"
                  placeholder="Почта"
              />
            </div>

            <!-- Логин -->
            <div>
              <Label>Логин</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.result?.login || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.login"
                  type="text"
                  placeholder="Логин"
              />
            </div>
            <div v-if="isEditing" class="flex justify-center items-center gap-4">
              <Button
                  @click="saveChanges"
              >
                Сохранить
              </Button>
              <Button
                  variant="outline"
                  @click="cancelEdit"
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
