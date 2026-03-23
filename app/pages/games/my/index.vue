<script setup lang="ts">
const showCreateDialog = ref(false)

const { games, loading, refresh } = useGamesList({
  endpoint: '/games/my',
  key: 'my-games'
})

const loadGames = () => refresh()
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between mb-8">
      <h1 class="text-3xl font-semibold">Мои игры</h1>

      <Button @click="showCreateDialog = true">
        Создать игру
      </Button>
    </div>

    <GameList
        :games="games"
        :loading="loading"
        show-actions
        empty-text="У вас пока нет игр"
    />

    <GameCreateDialog
        v-model:open="showCreateDialog"
        @created="loadGames"
    />
  </div>
</template>
