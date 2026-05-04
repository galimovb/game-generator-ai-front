<script setup lang="ts">
const showCreateDialog = ref(false)

const { games, loading, incrementComments, decrementComments, toggleLike, refresh } = useGamesList({
  endpoint: '/games/my',
  key: 'my-games'
})
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
        @comment:created="incrementComments"
        @comment:deleted="decrementComments"
        @like:toggle="toggleLike"
    />

    <GameCreateDialog
        v-model:open="showCreateDialog"
        @created="refresh"
    />
  </div>
</template>
