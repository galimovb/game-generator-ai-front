<script setup lang="ts">
import { Camera, Loader } from 'lucide-vue-next'

const profileStore = useProfileStore()
const { profile, loading, error, uploading, avatarUrl, fullName } = storeToRefs(profileStore)

const isEditing = ref(false)
const editForm = ref<Partial<UserProfile>>({})

const initForm = () => {
  if (profile.value) {
    editForm.value = {
      name: profile.value.name || '',
      lastName: profile.value.lastName || '',
      middleName: profile.value.middleName || '',
      email: profile.value.email,
      login: profile.value.login
    }
  }
}

watch(profile, initForm, { immediate: true })

const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    await profileStore.uploadAvatar(input.files[0])
  } finally {
    input.value = ''
  }
}

const saveChanges = async () => {
  await profileStore.updateProfile(editForm.value)
  isEditing.value = false
}

const cancelEdit = () => {
  initForm()
  isEditing.value = false
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div v-if="loading" class="border rounded-lg p-6">
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

    <!-- Ошибка -->
    <div v-else-if="error" class="text-center py-12">
      <p>{{ error }}</p>
      <Button @click="profileStore.fetchProfile" class="mt-4">Повторить</Button>
    </div>

    <!-- Профиль -->
    <div v-else class="border rounded-lg p-6">
      <div class="flex gap-8">
        <!-- Аватар -->
        <div class="relative w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <div class="w-full h-full rounded-lg overflow-hidden border bg-muted">
            <img :src="avatarUrl" :alt="fullName" class="w-full h-full object-cover">
            <div v-if="uploading" class="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader class="w-8 h-8 animate-spin" />
            </div>
          </div>

          <label class="absolute -bottom-2 -right-2 cursor-pointer">
            <div class="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:bg-primary/90">
              <Camera class="w-5 h-5" />
            </div>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarSelect" :disabled="uploading">
          </label>
        </div>

        <!-- Информация -->
        <div class="flex-1">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-xl font-semibold">Профиль</h1>
            <Button v-if="!isEditing" @click="isEditing = true" variant="link">Изменить</Button>
          </div>

          <div class="space-y-4">
            <div v-for="field in ['name', 'lastName', 'middleName', 'email', 'login']" :key="field">
              <Label>{{ { name: 'Имя', lastName: 'Фамилия', middleName: 'Отчество', email: 'Почта', login: 'Логин' }[field] }}</Label>
              <div v-if="!isEditing" class="text-base">{{ profile?.[field as keyof typeof profile] || '—' }}</div>
              <Input v-else v-model="editForm[field as keyof UserProfile]" :placeholder="field" />
            </div>

            <div v-if="isEditing" class="flex gap-4">
              <Button @click="saveChanges">Сохранить</Button>
              <Button variant="outline" @click="cancelEdit">Отмена</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
