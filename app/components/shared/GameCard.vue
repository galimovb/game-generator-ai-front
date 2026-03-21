<script setup lang="ts">
import { Heart, MessageCircle } from 'lucide-vue-next'

withDefaults(defineProps<{
  game: Game
  showLikeButton: boolean
}>(), {
  game: {},
  showLikeButton: true
})

const showComments = ref(false)

const locationText = {
  indoor: 'В помещении',
  outdoor: 'На улице',
  both: 'Оба варианта'
}

const openComments = (e: Event) => {
  e.stopPropagation()
  showComments.value = true
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

      <CardDescription class="line-clamp-2">
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
            <span>{{ locationText[game.locationType] || '—' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Button v-if="showLikeButton" variant="ghost" size="icon" class="p-1">
              {{ game.likesCount }}
              <Heart :size="16"/>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                class="p-1"
                @click="openComments"
            >
              {{ game.commentsCount }}
              <MessageCircle :size="16"/>
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Диалог комментариев -->
  <CommentsDialog
      v-model:open="showComments"
      :game-id="game.id"
  />
</template>
