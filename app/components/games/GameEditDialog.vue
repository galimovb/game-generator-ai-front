<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Game } from '~/types/game'

const props = defineProps<{
  open: boolean
  game: Game
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const { patch } = useApi()
const config = useRuntimeConfig()

// Форма редактирования
const form = ref({
  title: '',
  description: '',
  minAge: 0,
  maxAge: 0,
  minPlayers: 0,
  maxPlayers: 0,
  duration: 0,
  locationType: '',
  requisites: [] as string[],
  isPublic: false
})

// Новый реквизит
const newRequisite = ref('')

// Инициализация формы при изменении game
watch(() => props.game, (game) => {
  if (game) {
    form.value = {
      title: game.title || '',
      description: game.description || '',
      minAge: game.minAge || 0,
      maxAge: game.maxAge || 0,
      minPlayers: game.minPlayers || 0,
      maxPlayers: game.maxPlayers || 0,
      duration: game.duration || 0,
      locationType: game.locationType || '',
      requisites: game.requisites || [],
      isPublic: game.isPublic || false
    }
  }
}, { immediate: true })

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

// Сохранение
const saveChanges = async () => {
  try {
    await patch(`/games/${props.game.id}`, form.value)
    emit('updated')
    emit('update:open', false)
  } catch (error) {
    console.error('Ошибка сохранения:', error)
  }
}

// Форматирование фото URL
const getPhotoUrl = (path: string) => {
  return `${config.public.apiBase}${path}`
}

// Закрытие
const onClose = () => {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="onClose">
    <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Редактирование игры</DialogTitle>
        <DialogDescription>
          Измените параметры игры
        </DialogDescription>
      </DialogHeader>

      <!-- Фото по середине вверху -->
      <div v-if="game.photos?.length" class="flex justify-center mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2 max-w-md">
          <img
              v-for="(photo, idx) in game.photos"
              :key="idx"
              :src="getPhotoUrl(photo)"
              class="w-24 h-24 rounded object-cover border"
              alt="Game photo"
          />
        </div>
      </div>

      <div class="space-y-4 py-4">
        <!-- Название -->
        <div class="space-y-2">
          <Label>Название</Label>
          <Input v-model="form.title" placeholder="Название игры" />
        </div>

        <!-- Описание -->
        <div class="space-y-2">
          <Label>Описание</Label>
          <Textarea v-model="form.description" placeholder="Описание игры" rows="3" />
        </div>

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
          <Select v-model="form.locationType">
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor">В помещении</SelectItem>
              <SelectItem value="outdoor">На улице</SelectItem>
              <SelectItem value="both">Оба варианта</SelectItem>
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

        <!-- Публичность -->
        <div class="flex items-center gap-2">
          <input type="checkbox" id="isPublic" v-model="form.isPublic" class="rounded border" />
          <Label for="isPublic">Публичная игра</Label>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="onClose">Отмена</Button>
        <Button @click="saveChanges">Сохранить</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
