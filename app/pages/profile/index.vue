<script setup lang="ts">
import { Camera, Loader, ImageIcon } from 'lucide-vue-next'
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { useForm } from "vee-validate"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form"

const profileStore = useProfileStore()
const { profile, loading, error, uploading, avatarUrl, fullName } = storeToRefs(profileStore)

const isEditing = ref(false)

const profileSchema = toTypedSchema(
  z.object({
    name: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
    lastName: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
    middleName: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
    email: z.string().min(1, "Обязательное поле").email("Введите корректный email"),
    login: z.string().max(255, "Максимум 255 символов").optional().or(z.literal("")),
  })
)

const { handleSubmit, setValues, resetForm } = useForm({
  validationSchema: profileSchema,
})

const initForm = () => {
  if (profile.value) {
    setValues({
      name: profile.value.name || "",
      lastName: profile.value.lastName || "",
      middleName: profile.value.middleName || "",
      email: profile.value.email,
      login: profile.value.login || "",
    })
  }
}

watch(profile, initForm, { immediate: true })

const startEdit = () => {
  initForm()
  isEditing.value = true
}

const onSubmit = handleSubmit(async (formValues) => {
  await profileStore.updateProfile(formValues)
  isEditing.value = false
})

const handleAvatarSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  try {
    await profileStore.uploadAvatar(input.files[0])
  } finally {
    input.value = ''
  }
}

const cancelEdit = () => {
  resetForm()
  initForm()
  isEditing.value = false
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div v-if="loading" class="border rounded-lg p-6">
      <div class="flex gap-8">
        <div class="w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <Skeleton class="w-full h-full rounded-lg" />
        </div>
        <div class="flex-1 space-y-4">
          <div class="flex justify-between items-center mb-6">
            <Skeleton class="h-7 w-24" />
            <Skeleton class="h-8 w-20" />
          </div>
          <div class="space-y-4">
            <div><Skeleton class="h-4 w-12 mb-2" /><Skeleton class="h-10 w-full" /></div>
            <div><Skeleton class="h-4 w-12 mb-2" /><Skeleton class="h-10 w-full" /></div>
            <div><Skeleton class="h-4 w-12 mb-2" /><Skeleton class="h-10 w-full" /></div>
            <div><Skeleton class="h-4 w-12 mb-2" /><Skeleton class="h-10 w-full" /></div>
            <div><Skeleton class="h-4 w-12 mb-2" /><Skeleton class="h-10 w-full" /></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p>{{ error }}</p>
      <Button class="mt-4" @click="profileStore.fetchProfile">Повторить</Button>
    </div>

    <div v-else class="border rounded-lg p-6">
      <div class="flex gap-8">
        <div class="relative w-28 h-28 md:w-48 md:h-48 flex-shrink-0">
          <div class="w-full h-full rounded-lg overflow-hidden border bg-muted">
            <img v-if="avatarUrl" :src="avatarUrl" :alt="fullName" class="w-full h-full object-cover">
            <div v-else class="flex justify-center items-center w-full h-full bg-muted">
              <ImageIcon :size="48" class="text-muted-foreground" />
            </div>
            <div v-if="uploading" class="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Loader class="w-8 h-8 animate-spin" />
            </div>
          </div>

          <label v-if="!uploading" class="absolute -bottom-2 -right-2 cursor-pointer">
            <div class="bg-primary text-primary-foreground rounded-full p-2.5 shadow-lg hover:bg-primary/90">
              <Camera class="w-5 h-5" />
            </div>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarSelect">
          </label>
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-xl font-semibold">Профиль</h1>
            <Button v-if="!isEditing" variant="link" @click="startEdit">Изменить</Button>
          </div>

          <form v-if="isEditing" class="space-y-4" @submit.prevent="onSubmit">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl><Input v-bind="componentField" /></FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="lastName">
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl><Input v-bind="componentField" /></FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="middleName">
              <FormItem>
                <FormLabel>Отчество</FormLabel>
                <FormControl><Input v-bind="componentField" /></FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Почта</FormLabel>
                <FormControl><Input v-bind="componentField" type="email" /></FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="login">
              <FormItem>
                <FormLabel>Логин</FormLabel>
                <FormControl><Input v-bind="componentField" /></FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="flex gap-4">
              <Button type="submit">Сохранить</Button>
              <Button variant="outline" @click="cancelEdit">Отмена</Button>
            </div>
          </form>

          <div v-else class="space-y-4">
            <div>
              <Label>Имя</Label>
              <div class="text-base">{{ profile?.name || '—' }}</div>
            </div>
            <div>
              <Label>Фамилия</Label>
              <div class="text-base">{{ profile?.lastName || '—' }}</div>
            </div>
            <div>
              <Label>Отчество</Label>
              <div class="text-base">{{ profile?.middleName || '—' }}</div>
            </div>
            <div>
              <Label>Почта</Label>
              <div class="text-base">{{ profile?.email || '—' }}</div>
            </div>
            <div>
              <Label>Логин</Label>
              <div class="text-base">{{ profile?.login || '—' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
