<script setup lang="ts">
import { Camera } from 'lucide-vue-next'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'created'): void
}>()

const { post } = useApi()

// Форма
const form = ref({
  minAge: 6,
  maxAge: 12,
  minPlayers: 4,
  maxPlayers: 20,
  duration: 60,
  locationType: 'outdoor',
  requisites: [] as string[],
  photos: [] as string[]
})

// Новый реквизит
const newRequisite = ref('')

// Фото
const photoPreviews = ref<string[]>([])
const uploadError = ref('')

const isCreating = ref(false)

// Добавление реквизита
const addRequisite = () => {
  if (newRequisite.value.trim()) {
    form.value.requisites.push(newRequisite.value.trim())
    newRequisite.value = ''
  }
}

// Удаление реквизита
const removeRequisite = (index: number) => {
  form.value.requisites.splice(index, 1)
}

// Обработка фото
const handlePhotoSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return

  for (const file of Array.from(input.files)) {
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Можно загружать только изображения'
      continue
    }

    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = 'Размер файла не должен превышать 10MB'
      continue
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      photoPreviews.value.push(base64)
      form.value.photos.push(base64)
    }
    reader.readAsDataURL(file)
  }
  input.value = ''
}

// Удалить фото
const removePhoto = (index: number) => {
  photoPreviews.value.splice(index, 1)
  form.value.photos.splice(index, 1)
}

// Создание игры
const createGame = async () => {
  try {
    isCreating.value = true
    await post('/games/generate', form.value)
    emit('created')
    resetForm()
    emit('update:open', false)
  } catch (error) {
    console.error('Ошибка создания игры:', error)
  } finally {
    isCreating.value = false
  }
}

// Сброс формы
const resetForm = () => {
  form.value = {
    minAge: 6,
    maxAge: 12,
    minPlayers: 4,
    maxPlayers: 20,
    duration: 60,
    locationType: 'outdoor',
    requisites: [],
    photos: []
  }
  photoPreviews.value = []
  uploadError.value = ''
  newRequisite.value = ''
}

// Закрытие
const onClose = () => {
  resetForm()
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="onClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto" :disable-outside-pointer-events="isCreating">
      <DialogHeader>
        <DialogTitle>Создание новой игры</DialogTitle>
        <DialogDescription>
          Заполните параметры игры и загрузите фото местности
        </DialogDescription>
      </DialogHeader>

      <!-- Фото по середине вверху -->
      <div class="flex justify-center mb-6">
        <div class="flex flex-wrap gap-2 justify-center max-w-md">
          <div
              v-for="(preview, index) in photoPreviews"
              :key="index"
              class="relative w-24 h-24 border rounded-md overflow-hidden"
          >
            <img :src="preview" class="w-full h-full object-cover" alt="Preview" />
            <button
                @click="removePhoto(index)"
                class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>

          <label class="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
            <Camera class="w-6 h-6" />
            <span class="text-xs mt-1">Добавить</span>
            <input type="file" multiple accept="image/*" class="hidden" @change="handlePhotoSelect" />
          </label>
        </div>
      </div>

      <p v-if="uploadError" class="text-sm text-red-500 text-center mb-4">{{ uploadError }}</p>

      <div class="space-y-4 py-4">
        <!-- Возраст -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Мин. возраст</Label>
            <Input v-model.number="form.minAge" type="number" min="3" max="80" />
          </div>
          <div class="space-y-2">
            <Label>Макс. возраст</Label>
            <Input v-model.number="form.maxAge" type="number" min="3" max="80" />
          </div>
        </div>

        <!-- Игроки -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Мин. игроков</Label>
            <Input v-model.number="form.minPlayers" type="number" min="1" />
          </div>
          <div class="space-y-2">
            <Label>Макс. игроков</Label>
            <Input v-model.number="form.maxPlayers" type="number" min="1" />
          </div>
        </div>

        <!-- Длительность -->
        <div class="space-y-2">
          <Label>Длительность (минут)</Label>
          <Input v-model.number="form.duration" type="number" min="5" />
        </div>

        <!-- Тип локации -->
        <div class="space-y-2">
          <Label>Тип локации</Label>
          <Select v-model="form.locationType" :disabled="saving">
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                  v-for="(value, key) in gameLocationTypes"
                  :value="key"
              >
                {{value}}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Реквизит -->
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <Label>Реквизит</Label>
            <div class="flex gap-2">
              <Input
                  v-model="newRequisite"
                  placeholder="Название"
                  class="w-40"
                  @keyup.enter="addRequisite"
              />
              <Button type="button" variant="outline" size="sm" @click="addRequisite">
                Добавить
              </Button>
            </div>
          </div>

          <!-- Список реквизита -->
          <div class="flex flex-wrap gap-2 mt-2">
            <div
                v-for="(item, index) in form.requisites"
                :key="index"
                class="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
            >
              <span>{{ item }}</span>
              <button
                  @click="removeRequisite(index)"
                  class="text-muted-foreground hover:text-foreground ml-1"
              >
                ×
              </button>
            </div>
            <span v-if="!form.requisites.length" class="text-sm text-muted-foreground">
              Нет реквизита
            </span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="isCreating" @click="onClose">Отмена</Button>
        <Button @click="createGame" :disabled="isCreating">Создать</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
