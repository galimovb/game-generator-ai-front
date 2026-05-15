<script setup lang="ts">
import { Heart, MessageCircle, Image as ImageIcon } from "lucide-vue-next";

const { post, del } = useApi();
const { $toast } = useNuxtApp();

const props = withDefaults(
  defineProps<{
    game: Game;
    showLikeButton?: boolean;
  }>(),
  {
    showLikeButton: true,
  },
);

const emit = defineEmits<{
  (e: "like:toggle", gameId: number): void;
  (e: "comment:created", gameId: number): void;
  (e: "comment:deleted", gameId: number): void;
}>();

const showComments = ref(false);

const openComments = () => {
  showComments.value = true;
};

const toggleLike = async () => {
  try {
    if (props.game.isLiked) {
      await del(`/games/${props.game.id}/like`);
    } else {
      await post(`/games/${props.game.id}/like`);
    }
    emit("like:toggle", props.game.id);
  } catch (e) {
    $toast.error("Произошла ошибка", {
      action: {
        label: "Повторить",
        onClick: () => toggleLike(),
      },
    });
  }
};

const handleCommentCreated = (gameId: number) => {
  emit("comment:created", gameId);
};

const handleCommentDeleted = (gameId: number) => {
  emit("comment:deleted", gameId);
};
</script>

<template>
  <Card
    class="cursor-pointer hover:shadow-lg transition-shadow relative group"
    @click="goToGame(game.id)"
  >
    <div class="absolute top-2 right-2 text-xs text-muted-foreground z-10">
      {{ formatDate(game.createdAt) }}
    </div>

    <CardHeader>
      <div v-if="game.photos?.length" class="relative">
        <Carousel>
          <CarouselContent>
            <CarouselItem v-for="(photo, idx) in game.photos" :key="idx">
              <div class="flex justify-center">
                <img
                  :src="getPhotoUrl(photo)"
                  class="w-full h-48 object-cover rounded-lg border"
                  :alt="`Game photo ${idx + 1}`"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious
            v-if="game.photos?.length > 1"
            class="absolute left-2 top-1/2 -translate-y-1/2"
          />
          <CarouselNext
            v-if="game.photos?.length > 1"
            class="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </Carousel>
      </div>

      <!-- Иконка-заглушка когда нет фото -->
      <div
        v-else
        class="flex justify-center items-center w-full h-48 bg-muted rounded-lg border"
      >
        <ImageIcon :size="48" class="text-muted-foreground" />
      </div>

      <CardTitle class="flex-1 mt-4">{{
        game.title || "Без названия"
      }}</CardTitle>

      <CardDescription class="line-clamp-3">
        {{ game.description || "Нет описания" }}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <!-- Параметры -->
      <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Возраст:</span>
          <span>{{ game?.age }} лет</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Игроков:</span>
          <span>{{ game?.players }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Длительность:</span>
          <span>{{ game.duration }} мин</span>
        </div>
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">Локация:</span>
            <span>{{ gameLocationTypes?.[game?.locationType] || "—" }}</span>
          </div>
        </div>
      </div>
    </CardContent>

    <CardFooter class="justify-between gap-2">
      <div class="flex items-center gap-2">
        <Button
          v-if="showLikeButton"
          variant="ghost"
          size="icon"
          class="p-1.5"
          @click.stop="toggleLike"
        >
          {{ game?.likesCount }}
          <Heart
            :size="16"
            :class="{
              'text-destructive': game.isLiked,
            }"
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="p-1.5"
          @click.stop="openComments"
        >
          {{ game?.commentsCount }}
          <MessageCircle :size="16" />
        </Button>
      </div>
      <Button variant="ghost" class="rounded-full w-8 h-8">
        <User :show-name="false" :user="game.author" :size="8" />
      </Button>
    </CardFooter>
  </Card>

  <CommentsDialog
    v-model:open="showComments"
    :game-id="game.id"
    @comment:created="handleCommentCreated"
    @comment:deleted="handleCommentDeleted"
  />
</template>
