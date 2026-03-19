<script setup lang="ts">
import { Camera, Loader } from 'lucide-vue-next'

const profileStore = useProfileStore()

if (process.server) {
  await profileStore.fetchProfile()
} else {
  if (!profileStore.profile) {
    await profileStore.fetchProfile()
  }
}

const isEditing = ref(false)
const editForm = ref(profileStore.getProfileForm())

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

const {
  avatarUrl,
  uploading,
  uploadError,
  profile,
  error
} = storeToRefs(profileStore)
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div v-if="error" class="text-center py-12">
      <p>{{ error }}</p>
      <Button @click="profileStore.fetchProfile(true)" class="mt-4">
        Повторить
      </Button>
    </div>

    <div v-else class="border rounded-lg p-6">
      <div class="flex gap-8">
        <div class="w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <div class="relative">
            <div class="w-28 h-28 md:w-48 md:h-48 rounded-lg overflow-hidden border bg-muted">
              <img
                  :src="avatarUrl"
                  :alt="profileStore.profile?.name || 'Avatar'"
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
              <div v-if="!isEditing" class="text-base">{{ profile?.lastName || '—' }}</div>
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
