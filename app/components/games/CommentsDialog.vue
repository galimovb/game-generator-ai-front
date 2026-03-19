<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { Send, Loader, MessageCircle, Reply, X, MoreVertical, Trash2 } from 'lucide-vue-next'
import { toast } from "vue-sonner"
import type { GameComment } from '~/types/comment'
import { formatDate, getPhotoUrl, getUserFullName } from "../../lib/helpers"
import { useProfileStore } from '~/stores/profile'

const props = defineProps<{
  gameId: number
  open: boolean
}>()

defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { get, post, del } = useApi()
const profileStore = useProfileStore()

const currentUserId = computed(() => profileStore.profile?.id)

const state = reactive({
  comments: [] as GameComment[],
  loading: false,
  page: 1,
  hasMore: true,
  form: {
    text: '',
    parentId: null as number | null,
    submitting: false
  }
})

const containerRef = ref<HTMLElement>()

const loadComments = async (reset = false) => {
  if (state.loading || (!reset && !state.hasMore)) return

  if (reset) {
    state.comments = []
    state.page = 1
    state.hasMore = true
  }

  state.loading = true
  try {
    const res = await get(`/games/${props.gameId}/comments`, {
      query: { page: state.page, limit: 20 }
    })

    if (reset) {
      state.comments = res.result.items
    } else {
      state.comments.push(...res.result.items)
    }

    state.hasMore = state.comments.length < res.result.pagination.total
    state.page++
  } catch (err) {
    toast.error('Ошибка загрузки комментариев')
  } finally {
    state.loading = false
  }
}

const submitComment = async () => {
  if (!state.form.text.trim() || state.form.submitting) return

  state.form.submitting = true
  try {
    const res = await post(`/games/${props.gameId}/comments`, {
      text: state.form.text,
      parentId: state.form.parentId || undefined
    })
    state.comments.push(res.result)
    state.form.text = ''
    state.form.parentId = null
  } catch (err) {
    toast.error('Ошибка при отправке')
  } finally {
    state.form.submitting = false
  }
}

const deleteComment = async (commentId: number) => {
  try {
    await del(`/games/${props.gameId}/comments/${commentId}`)
    state.comments = state.comments.filter(c => c.id !== commentId)
    toast.success('Комментарий удален')
  } catch (err) {
    toast.error('Ошибка при удалении')
  }
}

const setReplyTo = (comment: GameComment) => {
  state.form.parentId = comment.id
  state.form.text = ''
}

const cancelReply = () => {
  state.form.parentId = null
  state.form.text = ''
}

const isMyComment = (comment: GameComment) => {
  return comment.author.id === currentUserId.value
}

const getParentComment = (parentId: number) => {
  return state.comments.find(c => c.id === parentId)
}

const onScroll = () => {
  if (!containerRef.value || state.loading || !state.hasMore) return
  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadComments()
  }
}

watch(() => props.open, async (val) => {
  if (val) {
    await profileStore.fetchProfile()
    await loadComments(true)
  }
})
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[500px] max-h-screen p-0 gap-0 flex flex-col">
      <DialogHeader class="px-4 py-3 border-b flex-shrink-0">
        <div class="flex items-center justify-between">
          <DialogTitle class="flex items-center gap-2 text-base">
            Комментарии
          </DialogTitle>
        </div>
      </DialogHeader>

      <div
          ref="containerRef"
          class="flex-1 overflow-y-auto p-4 space-y-4"
          @scroll="onScroll"
      >
        <div v-if="state.loading && !state.comments.length" class="flex justify-center py-8">
          <Loader class="w-5 h-5 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="!state.comments.length" class="text-center py-12">
          <MessageCircle class="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
          <p class="text-sm text-muted-foreground">Нет комментариев</p>
        </div>

        <div v-else v-for="comment in state.comments" :key="comment.id">
          <div :class="['flex', isMyComment(comment) ? 'justify-end' : '']">
            <div class="flex gap-2 max-w-[85%] items-end">
              <Avatar v-if="!isMyComment(comment)" class="h-8 w-8 flex-shrink-0">
                <AvatarImage :src="getPhotoUrl(comment.author?.avatar)" />
                <AvatarFallback>{{ comment.author?.name?.charAt(0) || '?' }}</AvatarFallback>
              </Avatar>

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <DropdownMenu v-if="isMyComment(comment)">
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="xs" class="h-6 w-6">
                        <MoreVertical class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="setReplyTo(comment)">
                        <Reply class="w-4 h-4 mr-2" />
                        Ответить
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="deleteComment(comment.id)" class="text-destructive">
                        <Trash2 class="w-4 h-4 mr-2" />
                        Удалить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <span class="font-medium text-sm">{{ getUserFullName(comment.author) }}</span>
                  <DropdownMenu v-if="!isMyComment(comment)">
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="xs" class="h-6 w-6">
                        <MoreVertical class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="setReplyTo(comment)">
                        <Reply class="w-4 h-4 mr-2" />
                        Ответить
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div :class="['rounded-md p-3 relative', isMyComment(comment) ? 'bg-muted text-muted-foreground' : 'border']">
                  <div v-if="comment.parentId" class="mb-2">
                    <div class="text-sm text-muted-foreground bg-muted/30 rounded-lg py-1 px-2 border border-muted-foreground/20 relative">
                      <div class="h-full bg-primary p-0.5 rounded-l-lg absolute top-0 left-0"/>
                      <span class="font-medium">{{ getUserFullName(getParentComment(comment.parentId)?.author) }}</span>
                      <p class="text-sm mt-1">{{ getParentComment(comment.parentId)?.text }}</p>
                    </div>
                  </div>
                  <p class="text-sm break-words whitespace-pre-wrap">{{ comment.text }}</p>
                  <span class="absolute right-0.5 bottom-0.5 text-[10px] text-muted-foreground">
                    {{ formatDate(comment.createdAt) }}
                  </span>
                </div>
              </div>

              <Avatar v-if="isMyComment(comment)" class="h-8 w-8 flex-shrink-0">
                <AvatarImage :src="getPhotoUrl(comment.author?.avatar)" />
                <AvatarFallback>{{ comment.author?.name?.charAt(0)}}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        <div v-if="state.loading && state.comments.length" class="flex justify-center py-2">
          <Loader class="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      </div>

      <div class="p-3 border-t flex-shrink-0 space-y-2">
        <div v-if="state.form.parentId" class="flex items-center justify-between bg-muted/50 rounded-lg p-2 text-sm">
          <div class="flex items-center gap-2">
            <Reply :size="18"/>
            <div class="flex flex-col gap-1">
              <span class="font-bold inline-block truncate">В ответ {{ getUserFullName(getParentComment(state.form.parentId)?.author) }}</span>
              <span class="inline-block truncate">{{ getParentComment(state.form.parentId)?.text }}</span>
            </div>
          </div>
          <Button variant="ghost" size="xs" class="h-6 w-6" @click="cancelReply">
            <X class="w-3 h-3" />
          </Button>
        </div>

        <div class="flex gap-2">
          <Input
              v-model="state.form.text"
              :placeholder="state.form.parentId ? 'Написать ответ...' : 'Написать комментарий...'"
              class="flex-1"
              @keyup.enter="submitComment"
          />
          <Button
              size="sm"
              @click="submitComment"
              :disabled="!state.form.text.trim() || state.form.submitting"
          >
            <Send v-if="!state.form.submitting" class="w-4 h-4" />
            <Loader v-else class="w-4 h-4 animate-spin" />
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
