<script setup lang="ts">
import { Camera, Loader } from 'lucide-vue-next'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'created'): void
}>()

const { post } = useApi()
const { $toast } = useNuxtApp()

const form = ref({
  age: 8,
  players: 12,
  duration: 60,
  locationType: 'outdoor',
  fieldWidth: 20,
  fieldLength: 20,
  activityLevel: 'medium',
  requisites: [] as string[],
  photos: [] as string[]
})

const newRequisite = ref('')
const photoPreviews = ref<string[]>([])
const uploadError = ref('')
const isCreating = ref(false)

const addRequisite = () => {
  if (newRequisite.value.trim()) {
    form.value.requisites.push(newRequisite.value.trim())
    newRequisite.value = ''
  }
}

const removeRequisite = (index: number) => {
  form.value.requisites.splice(index, 1)
}

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

const removePhoto = (index: number) => {
  photoPreviews.value.splice(index, 1)
  form.value.photos.splice(index, 1)
}

const createGame = async () => {
  try {
    isCreating.value = true
    await post('/games/generate', form.value)
    emit('created')
    resetForm()
    emit('update:open', false)
    $toast.success('Игра успешно создана')
  } catch (error) {
    console.error('Ошибка создания игры:', error)
    $toast.error('Ошибка создания игры', {
      action: {
        label: 'Повторить',
        onClick: () => createGame(),
      },
    })
  } finally {
    isCreating.value = false
  }
}

const resetForm = () => {
  form.value = {
    age: 8,
    players: 12,
    duration: 60,
    locationType: 'outdoor',
    fieldWidth: 20,
    fieldLength: 20,
    activityLevel: 'medium',
    requisites: [],
    photos: []
  }
  photoPreviews.value = []
  uploadError.value = ''
  newRequisite.value = ''
}

const onClose = () => {
  if (isCreating.value) return
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
        <div class="space-y-2">
          <Label>Возраст</Label>
          <Input v-model.number="form.age" type="number" min="3" max="80" />
        </div>

        <div class="space-y-2">
          <Label>Количество игроков</Label>
          <Input v-model.number="form.players" type="number" min="1" max="500" />
        </div>

        <div class="space-y-2">
          <Label>Длительность (минут)</Label>
          <Input v-model.number="form.duration" type="number" min="5" max="480" />
        </div>

        <div class="space-y-2">
          <Label>Тип локации</Label>
          <Select v-model="form.locationType">
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                  v-for="(value, key) in gameLocationTypes"
                  :key="key"
                  :value="key"
              >
                {{ value }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Ширина площадки (м)</Label>
            <Input v-model.number="form.fieldWidth" type="number" min="1" max="1000" />
          </div>
          <div class="space-y-2">
            <Label>Длина площадки (м)</Label>
            <Input v-model.number="form.fieldLength" type="number" min="1" max="1000" />
          </div>
        </div>

        <div class="space-y-2">
          <Label>Уровень активности</Label>
          <Select v-model="form.activityLevel">
            <SelectTrigger>
              <SelectValue placeholder="Выберите уровень" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                  v-for="(value, key) in activityLevels"
                  :key="key"
                  :value="key"
              >
                {{ value }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        <Button @click="createGame" :disabled="isCreating">
          <Loader v-if="isCreating" :size="16" class="animate-spin" />
          Создать
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
