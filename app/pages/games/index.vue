<script setup lang="ts">
const { games, loading, incrementComments, decrementComments, toggleLike } =
  useGamesList({
    endpoint: "/games",
    key: "games-list",
  });
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-semibold">Список игр</h1>
    </div>

    <GameList
      :games="games"
      :loading="loading"
      empty-text="Пока никто не выложил игру"
      @comment:created="incrementComments"
      @comment:deleted="decrementComments"
      @like:toggle="toggleLike"
    />
  </div>
</template>
