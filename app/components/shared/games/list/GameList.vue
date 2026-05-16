<script setup lang="ts">
import { Loader } from "lucide-vue-next";

defineProps<{
  games: Game[];
  loading: boolean;
  emptyText?: string;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  "comment:created": [gameId: number];
  "comment:deleted": [gameId: number];
  "like:toggle": [gameId: number];
}>();

const handleCommentCreated = (gameId: number) => {
  emit("comment:created", gameId);
};

const handleCommentDeleted = (gameId: number) => {
  emit("comment:deleted", gameId);
};

const handleLikeToggle = (gameId: number) => {
  emit("like:toggle", gameId);
};
</script>

<template>
  <div v-if="loading" class="text-center py-8">
    <Loader class="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
  </div>

  <div v-else-if="games.length === 0" class="text-center">
    <p class="text-muted-foreground">
      {{ emptyText || "Нет данных" }}
    </p>
  </div>

  <div
    v-else
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3"
  >
    <GameListItem
      v-for="game in games"
      :key="game.id"
      :game="game"
      :show-actions="showActions"
      @comment:created="handleCommentCreated"
      @comment:deleted="handleCommentDeleted"
      @like:toggle="handleLikeToggle"
    />
  </div>
</template>
