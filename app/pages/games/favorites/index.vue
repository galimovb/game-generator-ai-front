<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

const { get } = useApi()

const page = ref<number>(1)
const limit = ref<number>(20)

const { data: gamesResponse, pending } = await useAsyncData<{ result: { items: Game[], pagination: { total: number } } }>(
    'games-list',
    async (): Promise<{ result: { items: Game[], pagination: { total: number } } }> => {
      return await get('/games/favorite', {
        query: { page: page.value, limit: limit.value }
      })
    },
    {
      watch: [page],
      server: true,
      default: (): { result: { items: Game[], pagination: { total: number } } } => ({ result: { items: [], pagination: { total: 0 } } })
    }
)

const games = computed<Game[]>(() => gamesResponse.value?.result?.items || [])
const total = computed<number>(() => gamesResponse.value?.result?.pagination?.total || 0)
const loading = computed<boolean>(() => pending.value)
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="flex justify-between items-center gap-4">
      <h1 class="text-lg md:text-xl lg:text-3xl font-semibold tracking-tight">Список игр</h1>
    </div>

    <!-- Список игр -->
    <div v-if="loading" class="text-center py-8">
      <Loader class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
    </div>

    <div v-else-if="games.length === 0" class="text-center py-12">
      <p class="text-muted-foreground"> У вас пока нет избранных игр</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
      />
    </div>
  </div>
</template>
