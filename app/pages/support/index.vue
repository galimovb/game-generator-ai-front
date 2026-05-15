<script setup lang="ts">
import { Send, ArrowLeft, Loader2, Paperclip, X } from "lucide-vue-next";
import { ticketStatusConfig } from "~/lib/tickets";

const router = useRouter();
const route = useRoute();
const api = useApi();
const { $toast } = useNuxtApp();
const profileStore = useProfileStore();

/**
 * ID выбранного тикета из URL
 */
const selectedTicketId = computed(() => {
  const id = route.query.ticket_id;
  return id ? parseInt(id as string) : null;
});

const statusFilter = ref("all");
const page = ref(1);
const limit = 20;
const searchQuery = ref("");
const messagesContainer = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

/**
 * Кэш сообщений по тикетам
 * loaded - флаг, что тикет уже опрошен (даже если сообщений нет)
 */
const messagesCache = ref<
  Map<
    number,
    {
      items: TicketMessage[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        hasMore: boolean;
      };
      loading: boolean;
      loadingMore: boolean;
      loaded: boolean;
    }
  >
>(new Map());

const statusConfig = ticketStatusConfig;

const {
  data: tickets,
  pending: ticketsPending,
  refresh: refreshTickets,
} = await useAsyncData(
  "tickets",
  async () => {
    const params = new URLSearchParams();
    params.append("page", page.value.toString());
    params.append("limit", limit.toString());
    if (statusFilter.value !== "all") {
      params.append("status", statusFilter.value);
    }
    if (searchQuery.value) {
      params.append("search", searchQuery.value);
    }

    const response = await api.get(`/tickets?${params.toString()}`);
    return response.result as {
      items: Ticket[];
      pagination: { page: number; limit: number; total: number };
    };
  },
  {
    watch: [statusFilter, page, searchQuery],
    default: () => ({
      items: [],
      pagination: { page: 1, limit: 20, total: 0 },
    }),
    lazy: true,
  },
);

const selectedTicket = computed(() => {
  if (!selectedTicketId.value || !tickets.value?.items) return null;
  return tickets.value.items.find((t) => t.id === selectedTicketId.value);
});

/**
 * Получение кэша для текущего тикета
 */
const currentMessagesCache = computed(() => {
  if (!selectedTicketId.value) return null;

  if (!messagesCache.value.has(selectedTicketId.value)) {
    messagesCache.value.set(selectedTicketId.value, {
      items: [],
      pagination: { page: 0, limit: 50, total: 0, hasMore: true },
      loading: false,
      loadingMore: false,
      loaded: false,
    });
  }
  return messagesCache.value.get(selectedTicketId.value)!;
});

/**
 * Загрузка сообщений с пагинацией
 * @param loadMore - true: загрузка старых сообщений, false: первая загрузка
 */
const loadMessages = async (loadMore = false) => {
  if (!selectedTicketId.value || !currentMessagesCache.value) return;

  const cache = currentMessagesCache.value;
  if (cache.loading || cache.loadingMore) return;

  const nextPage = loadMore ? cache.pagination.page + 1 : 1;

  if (!loadMore && cache.loaded) return;
  if (loadMore && !cache.pagination.hasMore) return;

  const loadingState = loadMore ? "loadingMore" : "loading";
  cache[loadingState] = true;

  try {
    const response = await api.get(
      `/tickets/${selectedTicketId.value}/messages`,
      {
        params: { page: nextPage, limit: 50 },
      },
    );

    const newMessages = response.result.items as TicketMessage[];
    const total = response.result.pagination.total;

    if (loadMore) {
      cache.items = [...newMessages, ...cache.items];
    } else {
      cache.items = newMessages;
      cache.loaded = true;
    }

    cache.pagination = {
      page: nextPage,
      limit: 50,
      total,
      hasMore: cache.items.length < total,
    };
  } catch (error) {
    console.error("Failed to load messages", error);
  } finally {
    cache[loadingState] = false;
  }
};

/**
 * Добавление нового сообщения в кэш (без перезапроса)
 */
const addMessageToCache = (newMessage: TicketMessage) => {
  if (!selectedTicketId.value || !currentMessagesCache.value) return;

  const cache = currentMessagesCache.value;
  cache.items = [...cache.items, newMessage];
  cache.pagination.total += 1;
  cache.pagination.hasMore = cache.items.length < cache.pagination.total;
};

/**
 * Обработка скролла для загрузки старых сообщений
 */
const handleScroll = () => {
  if (!messagesContainer.value || !currentMessagesCache.value) return;

  const cache = currentMessagesCache.value;
  if (cache.loadingMore || !cache.pagination.hasMore) return;

  if (messagesContainer.value.scrollTop === 0) {
    const oldScrollHeight = messagesContainer.value.scrollHeight;
    loadMessages(true).then(() => {
      setTimeout(() => {
        if (messagesContainer.value) {
          const newScrollHeight = messagesContainer.value.scrollHeight;
          messagesContainer.value.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }, 0);
    });
  }
};

const newMessage = ref("");
const sending = ref(false);
const selectedPhotos = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);

/**
 * Прокрутка вниз при появлении новых сообщений
 */
watch(
  currentMessagesCache,
  (cache) => {
    if (cache?.items.length && !cache.loadingMore) {
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        }
      }, 100);
    }
  },
  { deep: true },
);

/**
 * Загрузка сообщений при смене тикета
 */
watch(
  selectedTicketId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      const cache = messagesCache.value.get(newId);
      if (!cache?.loaded) {
        await loadMessages(false);
      }
    }
  },
  { immediate: true },
);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  const imageFiles = files.filter((file) => file.type.startsWith("image/"));

  if (imageFiles.length === 0) return;

  const newPhotos = [...selectedPhotos.value, ...imageFiles];

  if (newPhotos.length > 10) {
    alert("Можно загрузить не более 10 фото");
    return;
  }

  selectedPhotos.value = newPhotos;

  for (const file of imageFiles) {
    const preview = await fileToBase64(file);
    photoPreviews.value.push(preview);
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const removePhoto = (index: number) => {
  selectedPhotos.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

const sendMessage = async () => {
  if (
    (!newMessage.value.trim() && selectedPhotos.value.length === 0) ||
    !selectedTicketId.value ||
    sending.value
  )
    return;

  sending.value = true;
  try {
    const photosBase64: string[] = [];
    for (const photo of selectedPhotos.value) {
      const base64 = await fileToBase64(photo);
      photosBase64.push(base64);
    }

    const response = await api.post(
      `/tickets/${selectedTicketId.value}/messages`,
      {
        text: newMessage.value,
        photos: photosBase64,
      },
    );

    addMessageToCache(response.result);

    newMessage.value = "";
    selectedPhotos.value = [];
    photoPreviews.value = [];
  } catch (error) {
    $toast.error("Ошибка отправки сообщения");
    console.error("Failed to send message", error);
  } finally {
    sending.value = false;
  }
};

const goToTicket = (id: number) => {
  if (selectedTicketId.value === id) return;
  router.push({
    path: route.path,
    query: {
      ...route.query,
      ticket_id: id,
    },
  });
};

const closeChat = () => {
  if (!route.query.ticket_id) return;
  const { ticket_id, ...restQuery } = route.query;
  router.replace({
    path: route.path,
    query: restQuery,
  });
};

const getStatusVariant = (status: string) => {
  return (
    statusConfig[status as keyof typeof statusConfig]?.variant || "secondary"
  );
};

const onPageChange = (newPage: number) => {
  page.value = newPage;
};

const isMyMessage = (message: TicketMessage): boolean => {
  return message.author?.id === profileStore.profile?.id;
};
</script>

<template>
  <div class="h-full py-8 px-4 flex flex-col gap-4">
    <div class="flex items-center justify-between flex-shrink-0">
      <h1 class="text-3xl font-bold">Обращения</h1>
      <div class="flex items-center gap-2">
        <Select v-model="statusFilter" @update:model-value="page = 1">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все диалоги</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="waiting_for_user">Ожидают ответа</SelectItem>
          </SelectContent>
        </Select>
        <CreateTicketDialog @success="refreshTickets" />
      </div>
    </div>

    <div class="grid gap-4 grid-cols-3 flex-1 min-h-0">
      <div class="rounded-md col-span-1 bg-muted/50 flex flex-col min-h-0">
        <Input
          v-model="searchQuery"
          placeholder="Поиск"
          class="rounded-b-none flex-shrink-0"
        />

        <div v-if="ticketsPending" class="overflow-y-auto">
          <Card v-for="i in 5" :key="i" class="rounded-none">
            <CardContent class="p-4">
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  <Skeleton class="h-5 w-2/3 mb-2" />
                  <Skeleton class="h-4 w-full" />
                </div>
                <Skeleton class="h-6 w-12" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div v-else class="overflow-y-auto flex-1">
          <div
            v-for="ticket in tickets?.items"
            :key="ticket.id"
            class="cursor-pointer hover:shadow-lg hover:bg-muted/55 transition-shadow border-b border-background"
            :class="{ 'bg-muted/80 shadow-md': selectedTicketId === ticket.id }"
            @click="goToTicket(ticket.id)"
          >
            <div class="py-2 px-4">
              <div class="flex items-center gap-4">
                <div class="flex-1 min-w-0">
                  <p class="font-medium mb-1 line-clamp-1">
                    {{ ticket.subject || "Без темы" }}
                  </p>
                  <p class="text-sm text-muted-foreground line-clamp-1">
                    {{ ticket.description || "Нет описания" }}
                  </p>
                </div>
                <div class="h-full text-right">
                  <Badge
                    :variant="getStatusVariant(ticket.status)"
                    class="gap-1"
                  >
                    <component
                      :is="
                        statusConfig[ticket.status as keyof typeof statusConfig]
                          ?.icon
                      "
                      class="h-3 w-3"
                    />
                    {{
                      statusConfig[ticket.status as keyof typeof statusConfig]
                        ?.label
                    }}
                  </Badge>
                  <div class="text-xs text-muted-foreground mt-1">
                    {{ formatDate(ticket.createdAt) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!tickets?.items?.length"
            class="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground"
          >
            <MessageSquare class="h-8 w-8" />
            <p class="text-sm text-center">
              {{
                statusFilter !== "all"
                  ? "По выбранному фильтру обращения не найдены"
                  : "У вас пока нет обращений"
              }}
            </p>
          </div>
        </div>

        <div
          v-if="tickets?.pagination?.total > limit"
          class="flex justify-center p-4 border-t flex-shrink-0"
        >
          <Pagination
            :items-per-page="limit"
            :total="tickets?.pagination?.total"
            :sibling-count="1"
            show-edges
            :page="page"
            @update:page="onPageChange"
          >
            <PaginationList v-slot="{ items }" class="flex gap-1">
              <PaginationFirst />
              <PaginationPrev />
              <template v-for="(item, index) in items">
                <PaginationListItem
                  v-if="item.type === 'page'"
                  :key="index"
                  :value="item.value"
                  as-child
                >
                  <Button
                    :variant="item.value === page ? 'default' : 'outline'"
                    size="icon"
                    class="w-9 h-9"
                  >
                    {{ item.value }}
                  </Button>
                </PaginationListItem>
                <PaginationEllipsis v-else :key="item.type" :index="index" />
              </template>
              <PaginationNext />
              <PaginationLast />
            </PaginationList>
          </Pagination>
        </div>
      </div>

      <div
        class="md:col-span-2 rounded-md bg-muted/50 flex flex-col min-h-0"
        :class="{ 'hidden md:flex': !selectedTicketId }"
      >
        <template v-if="selectedTicket">
          <div
            class="border-b p-3 md:p-4 flex items-center justify-between flex-shrink-0 bg-muted/30 rounded-t-md"
          >
            <div class="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                class="md:hidden"
                @click="closeChat"
              >
                <ArrowLeft :size="16" />
              </Button>
              <User
                v-if="selectedTicket.assignedTo"
                :user="selectedTicket.assignedTo"
                :size="10"
                :show-name="true"
                name-position="right"
              />
            </div>
            <Badge
              :variant="getStatusVariant(selectedTicket.status)"
              class="gap-1"
            >
              <component
                :is="
                  statusConfig[
                    selectedTicket.status as keyof typeof statusConfig
                  ]?.icon
                "
                class="h-3 w-3"
              />
              {{
                statusConfig[selectedTicket.status as keyof typeof statusConfig]
                  ?.label
              }}
            </Badge>
          </div>

          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-4 space-y-4"
            @scroll="handleScroll"
          >
            <div
              v-if="currentMessagesCache?.loadingMore"
              class="flex justify-center py-2"
            >
              <Loader2 :size="20" class="animate-spin text-muted-foreground" />
            </div>

            <div
              v-if="
                currentMessagesCache?.loading &&
                !currentMessagesCache?.items.length
              "
              class="space-y-2"
            >
              <div
                v-for="i in 7"
                :key="i"
                class="flex"
                :class="i % 2 === 0 ? 'justify-end' : 'justify-start'"
              >
                <Skeleton class="h-12 w-48 rounded-lg" />
              </div>
            </div>

            <div v-else class="space-y-2">
              <template
                v-for="message in currentMessagesCache?.items"
                :key="message.id"
              >
                <!-- System message -->
                <div
                  v-if="message.messageType === 'system'"
                  class="flex justify-center"
                >
                  <div
                    class="flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs"
                  >
                    <span>{{ message.text }}</span>
                    <span class="opacity-60">·</span>
                    <span class="opacity-60">{{
                      formatDate(message.createdAt)
                    }}</span>
                  </div>
                </div>

                <!-- User message -->
                <div
                  v-else
                  class="flex gap-2"
                  :class="
                    isMyMessage(message) ? 'justify-end' : 'justify-start'
                  "
                >
                  <User
                    v-if="!isMyMessage(message)"
                    :user="message.author"
                    :size="8"
                    :show-name="false"
                    name-position="right"
                    class="self-end"
                  />
                  <div
                    class="max-w-[70%] rounded-lg p-3"
                    :class="
                      isMyMessage(message)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background'
                    "
                  >
                    <div class="flex items-center justify-between gap-3 mb-1">
                      <span class="text-xs font-medium">
                        {{ getUserFullName(message.author) }}
                      </span>
                      <span class="text-xs opacity-70">
                        {{ formatDate(message.createdAt) }}
                      </span>
                    </div>
                    <p class="text-sm whitespace-pre-wrap break-words">
                      {{ message.text }}
                    </p>
                    <div
                      v-if="message.photos?.length"
                      class="mt-2 grid grid-cols-2 gap-2"
                    >
                      <img
                        v-for="(photo, idx) in message.photos"
                        :key="idx"
                        :src="getPhotoUrl(photo)"
                        alt="Photo"
                        class="rounded-md max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  </div>
                  <User
                    v-if="isMyMessage(message)"
                    :user="message.author"
                    :size="8"
                    :show-name="false"
                    name-position="left"
                    class="self-end"
                  />
                </div>
              </template>

              <div
                v-if="
                  !currentMessagesCache?.items.length &&
                  !currentMessagesCache?.loading
                "
                class="flex flex-col items-center justify-center h-full"
              >
                <MessageSquare
                  class="h-12 w-12 mb-3 text-muted-foreground/50"
                />
                <p class="text-sm text-muted-foreground">Нет сообщений</p>
              </div>
            </div>
          </div>

          <div
            v-if="selectedTicket.status !== 'closed'"
            class="border-t p-3 md:p-4 flex-shrink-0 bg-muted/30 rounded-b-md"
          >
            <div v-if="photoPreviews.length" class="flex gap-2 mb-3 flex-wrap">
              <div
                v-for="(preview, index) in photoPreviews"
                :key="index"
                class="relative group"
              >
                <img
                  :src="preview"
                  alt="Preview"
                  class="w-12 h-12 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  class="absolute -top-2 -right-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removePhoto(index)"
                >
                  <X :size="10" />
                </Button>
              </div>
            </div>

            <div class="flex gap-2 items-end">
              <input
                ref="fileInputRef"
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <Button
                variant="secondary"
                size="icon"
                :disabled="sending"
                @click="fileInputRef?.click()"
              >
                <Paperclip :size="16" />
              </Button>
              <Textarea
                v-model="newMessage"
                placeholder="Напишите сообщение... (Ctrl+Enter для отправки)"
                class="resize-none bg-background"
                @keydown.ctrl.enter="sendMessage"
              />
              <Button
                :disabled="
                  sending || (!newMessage.trim() && !selectedPhotos.length)
                "
                size="icon"
                @click="sendMessage"
              >
                <Send v-if="!sending" :size="16" />
                <Loader2 v-else :size="16" class="animate-spin" />
              </Button>
            </div>
          </div>

          <div
            v-else
            class="border-t p-4 text-center text-muted-foreground flex-shrink-0 bg-muted/30 rounded-b-md"
          >
            <AlertCircle :size="16" class="inline mr-2" />
            Обращение закрыто. Новые сообщения недоступны.
          </div>
        </template>

        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <MessageSquare
              class="h-12 w-12 mx-auto mb-3 text-muted-foreground/50"
            />
            <h3 class="text-base font-medium mb-1 text-muted-foreground">
              Выберите обращение
            </h3>
            <p class="text-sm text-muted-foreground">
              Нажмите на обращение слева, чтобы открыть диалог
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
