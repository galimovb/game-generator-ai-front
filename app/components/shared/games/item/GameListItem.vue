<script setup lang="ts">
import { Heart, MessageCircle } from 'lucide-vue-next'

const { post, del } = useApi()

const props = withDefaults(defineProps<{
  game: Game
  showLikeButton: boolean
}>(), {
  game: {},
  showLikeButton: true
})

const emit = defineEmits<{
  (e: 'like:toggle', gameId: number): void
  (e: 'comment:created', gameId: number): void
  (e: 'comment:deleted', gameId: number): void
}>()

const showComments = ref(false)

const openComments = () => {
  showComments.value = true
}

const toggleLike = async () => {
  try {
    if (props.game.isLiked) {
      await del(`/games/${props.game.id}/like`)
    } else {
      await post(`/games/${props.game.id}/like`)
    }
    emit('like:toggle', props.game.id)
  } catch (e) {
    console.error('Ошибка лайка', e)
  }
}

const handleCommentCreated = (gameId: number) => {
  emit('comment:created', gameId)
}

const handleCommentDeleted = (gameId: number) => {
  emit('comment:deleted', gameId)
}
</script>

<template>
  <Card
      class="cursor-pointer hover:shadow-lg transition-shadow relative group"
      @click="goToGame(game.id)"
  >
    <CardHeader>
      <!-- Фото -->
      <div v-if="game.photos?.length" class="flex gap-2 mb-4 overflow-x-auto pb-2 justify-center">
        <img
            v-for="(photo, idx) in game.photos.slice(0, 3)"
            :key="idx"
            :src="getPhotoUrl(photo)"
            class="w-16 h-16 rounded object-cover border"
            alt="Game photo"
        />
        <div
            v-if="game.photos.length > 3"
            class="w-16 h-16 rounded border flex items-center justify-center text-sm text-muted-foreground"
        >
          +{{ game.photos.length - 3 }}
        </div>
      </div>

      <CardTitle class="flex-1">{{ game.title || 'Без названия' }}</CardTitle>

      <CardDescription class="line-clamp-3">
        {{ game.description || 'Нет описания' }}
      </CardDescription>
    </CardHeader>

    <CardContent>
      <!-- Параметры -->
      <div class="space-y-1 text-sm">
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Возраст:</span>
          <span>{{ game.minAge }}-{{ game.maxAge }} лет</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Игроков:</span>
          <span>{{ game.minPlayers }}-{{ game.maxPlayers }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Длительность:</span>
          <span>{{ game.duration }} мин</span>
        </div>
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">Локация:</span>
            <span>{{ gameLocationTypes[game.locationType] || '—' }}</span>
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
          {{ game.likesCount }}
          <Heart
              :size="16"
              :class="{
              'text-destructive': game.isLiked
            }"
          />
        </Button>
        <Button
            variant="ghost"
            size="icon"
            class="p-1.5"
            @click.stop="openComments"
        >
          {{ game.commentsCount }}
          <MessageCircle :size="16"/>
        </Button>
      </div>
      <Button variant="ghost" class="rounded-full w-8 h-8">
        <User :show-name="false" :user="game.author" :size="8"/>
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
