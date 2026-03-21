<script setup lang="ts">
import { Camera, Loader } from 'lucide-vue-next'

const profileStore = useProfileStore()

const isEditing = ref(false)
const editForm = ref(profileStore.getProfileForm())

const {
  avatarUrl,
  uploading,
  uploadError,
  profile,
  error,
  loading
} = storeToRefs(profileStore)

watch(() => profileStore.profile, (newProfile) => {
  if (newProfile && !isEditing.value) {
    editForm.value = {
      name: newProfile.name || '',
      lastName: newProfile.lastName || '',
      middleName: newProfile.middleName || '',
      email: newProfile.email || '',
      login: newProfile.login || ''
    }
  }
}, { immediate: true })

const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    await profileStore.uploadAvatar(input.files[0])
  } catch (error) {
    console.error('Avatar upload failed:', error)
  } finally {
    input.value = ''
  }
}

const saveChanges = async () => {
  try {
    await profileStore.updateProfile(editForm.value)
    isEditing.value = false
  } catch (err) {
    console.error('Save failed:', err)
  }
}

const cancelEdit = () => {
  editForm.value = profileStore.getProfileForm()
  isEditing.value = false
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <!-- Ошибка -->
    <div v-if="error" class="text-center py-12">
      <p>{{ error }}</p>
      <Button @click="profileStore.fetchProfile" class="mt-4">
        Повторить
      </Button>
    </div>

    <!-- Скелетон загрузки -->
    <div v-else-if="loading" class="border rounded-lg p-6">
      <div class="flex gap-8">
        <!-- Аватар скелетон -->
        <div class="w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <Skeleton class="w-full h-full rounded-lg" />
        </div>

        <!-- Информация скелетон -->
        <div class="flex-1 space-y-4">
          <div class="flex justify-between items-center mb-6">
            <Skeleton class="h-7 w-24" />
            <Skeleton class="h-8 w-20" />
          </div>

          <div class="space-y-4">
            <div>
              <Skeleton class="h-4 w-12 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div>
              <Skeleton class="h-4 w-12 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div>
              <Skeleton class="h-4 w-12 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div>
              <Skeleton class="h-4 w-12 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
            <div>
              <Skeleton class="h-4 w-12 mb-2" />
              <Skeleton class="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Контент профиля -->
    <div v-else class="border rounded-lg p-6">
      <div class="flex gap-8">
        <div class="w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <div class="relative">
            <div class="w-28 h-28 md:w-48 md:h-48 rounded-lg overflow-hidden border bg-muted">
              <img
                  :src="avatarUrl"
                  :alt="profile?.name || 'Avatar'"
                  class="w-full h-full object-cover"
              >
              <div
                  v-if="uploading"
                  class="absolute inset-0 bg-background/50 flex items-center justify-center"
              >
                <Loader class="w-8 h-8 animate-spin" />
              </div>
            </div>

            <label class="absolute -bottom-2 -right-2 cursor-pointer">
              <div class="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:bg-primary/90">
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
          <p v-if="uploadError" class="text-sm text-destructive mt-2">{{ uploadError }}</p>
          <p class="text-xs text-muted-foreground mt-2">JPG, PNG, GIF до 5MB</p>
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-xl font-semibold">Профиль</h1>
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
              <div v-if="!isEditing" class="text-base">{{ profile?.name || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.name"
                  type="text"
                  placeholder="Имя"
              />
            </div>

            <!-- Фамилия -->
            <div>
              <Label>Фамилия</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.lastName || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.lastName"
                  type="text"
                  placeholder="Фамилия"
              />
            </div>

            <!-- Отчество -->
            <div>
              <Label>Отчество</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.middleName || '—' }}</div>
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
              <div v-if="!isEditing" class="text-base">{{ profile?.email || '—' }}</div>
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
              <div v-if="!isEditing" class="text-base">{{ profile?.login || '—' }}</div>
              <Input
                  v-else
                  v-model="editForm.login"
                  type="text"
                  placeholder="Логин"
              />
            </div>

            <div v-if="isEditing" class="flex justify-center items-center gap-4">
              <Button @click="saveChanges">
                Сохранить
              </Button>
              <Button variant="outline" @click="cancelEdit">
                Отмена
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
