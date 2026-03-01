<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Loader } from 'lucide-vue-next'
import type { Game } from '~/types/game'
import GameCreateDialog from "../../components/games/GameCreateDialog.vue";
import GameEditDialog from "../../components/games/GameEditDialog.vue";

const { get } = useApi()
const config = useRuntimeConfig()

// Состояние
const games = ref<Game[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)

// Диалоги
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const selectedGame = ref<Game | null>(null)

// Загрузка игр
const loadGames = async () => {
  loading.value = true
  try {
    const response = await get('/games/my', {
      query: { page: page.value, limit: limit.value }
    })
    games.value = response.result.items
    total.value = response.result?.pagination?.total
  } catch (error) {
    console.error('Ошибка загрузки игр:', error)
  } finally {
    loading.value = false
  }
}

// Открыть редактирование
const openEditDialog = (game: Game) => {
  selectedGame.value = game
  showEditDialog.value = true
}

// Форматирование фото URL
const getPhotoUrl = (path: string) => {
  return `${config.public.apiBase}${path}`
}

onMounted(async() => {
  await loadGames()
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">Мои игры</h1>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        Создать игру
      </Button>
    </div>
    <!-- Список игр -->
    <div v-if="loading" class="text-center py-8">
      <Loader class="w-8 h-8 animate-spin mx-auto" />
    </div>

    <div v-else-if="games.length === 0" class="text-center py-8 text-muted-foreground">
      У вас пока нет игр
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
          v-for="game in games"
          :key="game.id"
          class="cursor-pointer hover:shadow-lg transition-shadow"
          @click="openEditDialog(game)"
      >
        <CardHeader>
          <!-- Фото -->
          <div v-if="game.photos?.length" class="flex gap-2 mb-4 overflow-x-auto pb-2 justify-center">
            <img
                v-for="(photo, idx) in game.photos.slice(0, 3)"
                :key="idx"
                :src="getPhotoUrl(photo)"
                class="w-16 h-16 rounded object-cover border"
                alt="Game photo"
            />
            <div
                v-if="game.photos.length > 3"
                class="w-16 h-16 rounded border flex items-center justify-center text-sm text-muted-foreground"
            >
              +{{ game.photos.length - 3 }}
            </div>
          </div>
          <CardTitle>{{ game.title || 'Без названия' }}</CardTitle>
          <CardDescription>{{ game.description || 'Нет описания' }}</CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Параметры -->
          <div class="space-y-1 text-sm">
            <div>Возраст: {{ game.minAge }}-{{ game.maxAge }} лет</div>
            <div>Игроков: {{ game.minPlayers }}-{{ game.maxPlayers }}</div>
            <div>Длительность: {{ game.duration }} мин</div>
            <div>Локация: {{ game.locationType === 'indoor' ? 'В помещении' : game.locationType === 'outdoor' ? 'На улице' : 'Оба варианта' }}</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Диалоги -->
    <GameCreateDialog
        v-model:open="showCreateDialog"
        @created="loadGames"
    />

    <GameEditDialog
        v-model:open="showEditDialog"
        :game="selectedGame"
        @updated="loadGames"
    />
  </div>
</template>
