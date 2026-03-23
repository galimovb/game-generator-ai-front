<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

defineProps<{
  games: Game[]
  loading: boolean
  emptyText?: string
  showActions?: boolean
}>()
</script>

<template>
  <!-- Loader -->
  <div v-if="loading" class="text-center py-8">
    <Loader class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
  </div>

  <!-- Empty -->
  <div v-else-if="games.length === 0" class="text-center py-12">
    <p class="text-muted-foreground">
      {{ emptyText || 'Нет данных' }}
    </p>
  </div>

  <!-- List -->
  <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <GameListItem
        v-for="game in games"
        :key="game.id"
        :game="game"
        :show-actions="showActions"
    />
  </div>
</template>
