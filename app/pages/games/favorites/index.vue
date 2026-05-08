<script setup lang="ts">
const { games, loading, incrementComments, decrementComments, toggleLike } =
  useGamesList({
    endpoint: "/games/liked",
    key: "games-liked",
  });
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-semibold">Избранные игры</h1>

    <GameList
      :games="games"
      :loading="loading"
      empty-text="У вас пока нет избранных игр"
      @comment:created="incrementComments"
      @comment:deleted="decrementComments"
      @like:toggle="toggleLike"
    />
  </div>
</template>
