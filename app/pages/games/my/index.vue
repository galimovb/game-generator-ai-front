<script setup lang="ts">
import { Plus, Loader } from 'lucide-vue-next'

const { get } = useApi()

const page = ref(1)
const limit = ref(20)
const showCreateDialog = ref(false)

const { data: gamesResponse, pending, refresh } = await useAsyncData<{ result: { items: Game[], pagination: { total: number } } }>(
    'my-games',
    async () => {
      try {
        return await get('/games/my', {
          query: { page: page.value, limit: limit.value }
        })
      } catch (e) {
        console.error('Ошибкааааа', e)
      }
    },
    {
      watch: [page],
      server: true,
      default: () => ({ result: { items: [], pagination: { total: 0 } } })
    }
)

const games = computed(() => gamesResponse.value?.result?.items || [])
const total = computed(() => gamesResponse.value?.result?.pagination?.total || 0)
const loading = computed(() => pending.value)

const loadGames = async () => {
  await refresh()
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-lg md:text-xl lg:text-3xl font-semibold tracking-tight">Мои игры</h1>
      <Button @click="showCreateDialog = true">
        <Plus class="w-4 h-4 mr-2" />
        Создать игру
      </Button>
    </div>

    <!-- Список игр -->
    <div v-if="loading" class="text-center py-8">
      <Loader class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
    </div>

    <div v-else-if="games.length === 0" class="text-center py-12">
      <p class="text-muted-foreground mb-4">У вас пока нет игр</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          :show-actions="true"
      />
    </div>

    <GameCreateDialog
        v-model:open="showCreateDialog"
        @created="loadGames"
    />
  </div>
</template>
