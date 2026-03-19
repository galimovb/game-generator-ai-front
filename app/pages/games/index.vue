<script setup lang="ts">
import { Loader, Heart, TextAlignJustify } from 'lucide-vue-next'
import type { Game } from '~/types/game'
import GameCard from "~/components/games/GameCard.vue"
import {goToGame} from "../../lib/helpers";

const { get } = useApi()

const page = ref<number>(1)
const limit = ref<number>(20)
const currentTab = ref<'all' | 'favorite'>('all')

const tabsSettings: Record<'all' | 'favorite', { label: string, icon: any, value: string, emptyText: string }> = {
  'all': { label: 'Все', icon: TextAlignJustify, value: 'all', emptyText: 'Пока нет публичных игр' },
  'favorite': { label: 'Избранное', icon: Heart, value: 'favorite', emptyText: 'Пока нет избранных игр' },
}

const getUrl = computed<string>(() => currentTab.value === 'all' ? '/games' : '/games/favorite')

const { data: gamesResponse, pending, refresh } = await useAsyncData<{ result: { items: Game[], pagination: { total: number } } }>(
    'games-list',
    async (): Promise<{ result: { items: Game[], pagination: { total: number } } }> => {
      return await get(getUrl.value, {
        query: { page: page.value, limit: limit.value }
      })
    },
    {
      watch: [currentTab, page],
      server: true,
      default: (): { result: { items: Game[], pagination: { total: number } } } => ({ result: { items: [], pagination: { total: 0 } } })
    }
)

const games = computed<Game[]>(() => gamesResponse.value?.result?.items || [])
const total = computed<number>(() => gamesResponse.value?.result?.pagination?.total || 0)
const loading = computed<boolean>(() => pending.value)

const loadGames = async (): Promise<void> => {
  await refresh()
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Заголовок -->
    <div class="flex justify-between items-center gap-4">
      <h1 class="text-lg md:text-xl lg:text-3xl font-semibold tracking-tight">Список игр</h1>
      <Tabs v-model="currentTab">
        <TabsList>
          <TabsTrigger
              v-for="tab in tabsSettings"
              :value="tab.value"
              :disabled="loading"
              class="gap-2"
          >
            <component
                :is="tab.icon"
                :size="16"
            />
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- Список игр -->
    <div v-if="loading" class="text-center py-8">
      <Loader class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
    </div>

    <div v-else-if="games.length === 0" class="text-center py-12">
      <p class="text-muted-foreground">{{ tabsSettings[currentTab].emptyText }}</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GameCard
          v-for="game in games"
          :key="game.id"
          :game="game"
          @click="goToGame(game.id)"
      />
    </div>
  </div>
</template>
