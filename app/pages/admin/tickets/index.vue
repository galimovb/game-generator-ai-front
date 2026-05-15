<script setup lang="ts">
import {
  Send,
  ArrowLeft,
  Loader2,
  Paperclip,
  X,
  UserCheck,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
} from "lucide-vue-next";

definePageMeta({
  layout: "admin",
  middleware: "admin",
});

const router = useRouter();
const route = useRoute();
const api = useApi();
const { $toast } = useNuxtApp();
const profileStore = useProfileStore();

// ==================== TICKETS LIST ====================

const selectedTicketId = computed(() => {
  const id = route.query.ticket_id;
  return id ? parseInt(id as string) : null;
});

const statusFilter = ref(route.query.status?.toString() || "all");
const page = ref(1);
const limit = 20;
const searchQuery = ref("");
const messagesContainer = ref<HTMLElement>();
const fileInputRef = ref<HTMLInputElement>();

const statusConfig = ticketStatusConfig;
const priorityConfig = ticketPriorityConfig;

const { data: tickets, pending: ticketsPending } = await useAsyncData(
  "admin-tickets",
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
  return (
    tickets.value.items.find((t) => t.id === selectedTicketId.value) ?? null
  );
});

// ==================== MESSAGES ====================

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
      { params: { page: nextPage, limit: 50 } },
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
  } catch {
    $toast.error("Ошибка загрузки сообщений");
  } finally {
    cache[loadingState] = false;
  }
};

const addMessageToCache = (newMessage: TicketMessage) => {
  if (!selectedTicketId.value || !currentMessagesCache.value) return;
  const cache = currentMessagesCache.value;
  cache.items = [...cache.items, newMessage];
  cache.pagination.total += 1;
};

const handleScroll = () => {
  if (!messagesContainer.value || !currentMessagesCache.value) return;
  const cache = currentMessagesCache.value;
  if (cache.loadingMore || !cache.pagination.hasMore) return;
  if (messagesContainer.value.scrollTop === 0) {
    const oldScrollHeight = messagesContainer.value.scrollHeight;
    loadMessages(true).then(() => {
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight - oldScrollHeight;
        }
      }, 0);
    });
  }
};

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

watch(
  selectedTicketId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      const cache = messagesCache.value.get(newId);
      if (!cache?.loaded) await loadMessages(false);
    }
  },
  { immediate: true },
);

// ==================== SEND MESSAGE ====================

const newMessage = ref("");
const sending = ref(false);
const selectedPhotos = ref<File[]>([]);
const photoPreviews = ref<string[]>([]);

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []).filter((f) =>
    f.type.startsWith("image/"),
  );
  if (!files.length) return;
  const merged = [...selectedPhotos.value, ...files];
  if (merged.length > 10) {
    $toast.error("Можно загрузить не более 10 фото");
    return;
  }
  selectedPhotos.value = merged;
  for (const file of files) {
    photoPreviews.value.push(await fileToBase64(file));
  }
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const removePhoto = (index: number) => {
  selectedPhotos.value.splice(index, 1);
  photoPreviews.value.splice(index, 1);
};

const sendMessage = async () => {
  if (
    (!newMessage.value.trim() && !selectedPhotos.value.length) ||
    !selectedTicketId.value ||
    sending.value
  )
    return;

  sending.value = true;
  try {
    const photosBase64: string[] = [];
    for (const photo of selectedPhotos.value) {
      photosBase64.push(await fileToBase64(photo));
    }
    const response = await api.post(
      `/tickets/${selectedTicketId.value}/messages`,
      { text: newMessage.value, photos: photosBase64 },
    );
    addMessageToCache(response.result);
    newMessage.value = "";
    selectedPhotos.value = [];
    photoPreviews.value = [];
  } catch {
    $toast.error("Ошибка отправки сообщения");
  } finally {
    sending.value = false;
  }
};

// ==================== ADMIN ACTIONS ====================

const actionLoading = ref(false);

const takeTicket = async () => {
  if (!selectedTicketId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await api.post(`/tickets/${selectedTicketId.value}/take`);
    updateTicketInList(res.result);
    $toast.success("Тикет взят в работу");
    invalidateMessagesCache();
    await loadMessages(false);
  } catch {
    $toast.error("Ошибка при взятии тикета");
  } finally {
    actionLoading.value = false;
  }
};

const changeStatus = async (status: string) => {
  if (!selectedTicketId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await api.post(`/tickets/${selectedTicketId.value}/status`, {
      status,
    });
    updateTicketInList(res.result);
    $toast.success("Статус обновлён");
    invalidateMessagesCache();
    await loadMessages(false);
  } catch {
    $toast.error("Ошибка при смене статуса");
  } finally {
    actionLoading.value = false;
  }
};

const changePriority = async (priority: string) => {
  if (!selectedTicketId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await api.post(`/tickets/${selectedTicketId.value}/priority`, {
      priority,
    });
    updateTicketInList(res.result);
    $toast.success("Приоритет обновлён");
    invalidateMessagesCache();
    await loadMessages(false);
  } catch {
    $toast.error("Ошибка при смене приоритета");
  } finally {
    actionLoading.value = false;
  }
};

const closeTicket = async () => {
  if (!selectedTicketId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    const res = await api.post(`/tickets/${selectedTicketId.value}/close`);
    updateTicketInList(res.result);
    $toast.success("Тикет закрыт");
    invalidateMessagesCache();
    await loadMessages(false);
  } catch {
    $toast.error("Ошибка при закрытии тикета");
  } finally {
    actionLoading.value = false;
  }
};

const updateTicketInList = (updated: Ticket) => {
  if (!tickets.value?.items) return;
  const idx = tickets.value.items.findIndex((t) => t.id === updated.id);
  if (idx !== -1) tickets.value.items[idx] = updated;
};

const invalidateMessagesCache = () => {
  if (!selectedTicketId.value) return;
  const cache = messagesCache.value.get(selectedTicketId.value);
  if (cache) cache.loaded = false;
};

// ==================== NAVIGATION ====================

const goToTicket = (id: number) => {
  if (selectedTicketId.value === id) return;
  router.push({ path: route.path, query: { ...route.query, ticket_id: id } });
};

const closeChat = () => {
  const { ticket_id, ...rest } = route.query;
  router.replace({ path: route.path, query: rest });
};

const getStatusVariant = (status: string) =>
  statusConfig[status as keyof typeof statusConfig]?.variant ?? "secondary";

const onPageChange = (newPage: number) => {
  page.value = newPage;
};

const isMyMessage = (message: TicketMessage): boolean =>
  message.author?.id === profileStore.profile?.id;

const isAlreadyAssigned = computed(
  () => selectedTicket.value?.assignedTo?.id === profileStore.profile?.id,
);
</script>

<template>
  <div
    class="flex-1 flex min-h-0 overflow-hidden"
    style="height: calc(100vh - 3.5rem)"
  >
    <!-- Ticket list -->
    <div class="w-80 flex-shrink-0 border-r flex flex-col min-h-0">
      <!-- Filters -->
      <div class="p-3 border-b space-y-2 flex-shrink-0">
        <Input
          v-model="searchQuery"
          placeholder="Поиск по теме..."
          class="h-8 text-sm"
        />
        <Select v-model="statusFilter" @update:model-value="page = 1">
          <SelectTrigger class="h-8 text-sm">
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="waiting_for_user">Ожидают ответа</SelectItem>
            <SelectItem value="resolved">Решённые</SelectItem>
            <SelectItem value="closed">Закрытые</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="ticketsPending" class="p-3 space-y-2">
          <Skeleton v-for="i in 8" :key="i" class="h-16 rounded-md" />
        </div>

        <div v-else>
          <div
            v-for="ticket in tickets?.items"
            :key="ticket.id"
            class="px-3 py-2.5 border-b cursor-pointer hover:bg-muted/50 transition-colors"
            :class="{ 'bg-muted/80': selectedTicketId === ticket.id }"
            @click="goToTicket(ticket.id)"
          >
            <div class="flex items-start justify-between gap-2 mb-1">
              <p class="text-sm font-medium line-clamp-1 flex-1">
                {{ ticket.subject || "Без темы" }}
              </p>
              <Badge
                :variant="getStatusVariant(ticket.status)"
                class="text-xs flex-shrink-0"
              >
                {{
                  statusConfig[ticket.status as keyof typeof statusConfig]
                    ?.label
                }}
              </Badge>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                {{ getUserFullName(ticket.author) || ticket.author?.email }}
              </span>
              <span
                class="text-xs font-medium"
                :class="
                  priorityConfig[ticket.priority as keyof typeof priorityConfig]
                    ?.color
                "
              >
                {{
                  priorityConfig[ticket.priority as keyof typeof priorityConfig]
                    ?.label
                }}
              </span>
            </div>
            <div class="text-xs text-muted-foreground mt-0.5">
              {{ formatDate(ticket.createdAt) }}
            </div>
          </div>

          <div
            v-if="!tickets?.items?.length"
            class="flex flex-col items-center justify-center gap-2 p-8 text-muted-foreground"
          >
            <MessageSquare class="h-8 w-8" />
            <p class="text-sm text-center">Тикеты не найдены</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="tickets?.pagination?.total > limit"
        class="p-2 border-t flex justify-center flex-shrink-0"
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
                  class="w-8 h-8 text-xs"
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

    <!-- Ticket detail -->
    <div class="flex-1 flex flex-col min-h-0 min-w-0">
      <template v-if="selectedTicket">
        <!-- Ticket header with admin actions -->
        <div
          class="border-b p-3 flex items-start justify-between flex-shrink-0 bg-muted/20"
        >
          <div class="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              class="h-7 w-7"
              @click="closeChat"
            >
              <ArrowLeft :size="14" />
            </Button>
            <div>
              <p class="font-semibold text-sm">{{ selectedTicket.subject }}</p>
              <div
                class="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <div class="flex items-center gap-1">
                  <span>Автор:</span>
                  <User :user="selectedTicket.author" :size="6" />
                </div>
                <div
                  v-if="selectedTicket.assignedTo"
                  class="flex items-center gap-1"
                >
                  <span>Назначен:</span>
                  <User :user="selectedTicket.assignedTo" :size="6" />
                </div>
              </div>
            </div>
          </div>

          <!-- Admin controls -->
          <div
            class="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end"
          >
            <!-- Take ticket -->
            <Button
              v-if="selectedTicket.status !== 'closed' && !isAlreadyAssigned"
              size="sm"
              variant="outline"
              class="h-7 text-xs gap-1"
              :disabled="actionLoading"
              @click="takeTicket"
            >
              <UserCheck :size="12" />
              Взять
            </Button>

            <!-- Change status -->
            <DropdownMenu v-if="selectedTicket.status !== 'closed'">
              <DropdownMenuTrigger as-child>
                <Button
                  size="sm"
                  variant="outline"
                  class="h-7 text-xs gap-1"
                  :disabled="actionLoading"
                >
                  <component
                    :is="
                      statusConfig[
                        selectedTicket.status as keyof typeof statusConfig
                      ]?.icon
                    "
                    :size="12"
                    :class="
                      statusConfig[
                        selectedTicket.status as keyof typeof statusConfig
                      ]?.color
                    "
                  />
                  {{
                    statusConfig[
                      selectedTicket.status as keyof typeof statusConfig
                    ]?.label
                  }}
                  <ChevronDown :size="12" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel class="text-xs"
                  >Изменить статус</DropdownMenuLabel
                >
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="(cfg, key) in statusConfig"
                  :key="key"
                  :disabled="
                    key === selectedTicket.status ||
                    key === 'closed' ||
                    key === 'in_progress'
                  "
                  class="text-xs gap-2"
                  @click="changeStatus(key)"
                >
                  <component :is="cfg.icon" :size="12" :class="cfg.color" />
                  {{ cfg.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Change priority -->
            <DropdownMenu v-if="selectedTicket.status !== 'closed'">
              <DropdownMenuTrigger as-child>
                <Button
                  size="sm"
                  variant="outline"
                  class="h-7 text-xs gap-1"
                  :disabled="actionLoading"
                >
                  <span
                    :class="
                      priorityConfig[
                        selectedTicket.priority as keyof typeof priorityConfig
                      ]?.color
                    "
                    class="font-medium"
                  >
                    {{
                      priorityConfig[
                        selectedTicket.priority as keyof typeof priorityConfig
                      ]?.label
                    }}
                  </span>
                  <ChevronDown :size="12" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel class="text-xs"
                  >Изменить приоритет</DropdownMenuLabel
                >
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  v-for="(cfg, key) in priorityConfig"
                  :key="key"
                  :disabled="key === selectedTicket.priority"
                  class="text-xs gap-2"
                  @click="changePriority(key)"
                >
                  <span :class="cfg.color" class="font-medium">{{
                    cfg.label
                  }}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Close ticket -->
            <Button
              v-if="selectedTicket.status !== 'closed'"
              size="sm"
              variant="destructive"
              class="h-7 text-xs"
              :disabled="actionLoading"
              @click="closeTicket"
            >
              Закрыть
            </Button>

            <Badge v-else variant="secondary" class="text-xs">Закрыт</Badge>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3"
          @scroll="handleScroll"
        >
          <div
            v-if="currentMessagesCache?.loadingMore"
            class="flex justify-center py-2"
          >
            <Loader2 :size="18" class="animate-spin text-muted-foreground" />
          </div>

          <div
            v-if="
              currentMessagesCache?.loading &&
              !currentMessagesCache?.items.length
            "
            class="space-y-2"
          >
            <div
              v-for="i in 6"
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
                <span
                  class="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full"
                >
                  {{ message.text }} - {{ formatDate(message.createdAt) }}
                </span>
              </div>

              <!-- Regular message -->
              <div
                v-else
                class="flex gap-2"
                :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
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
                      : message.messageType === 'support'
                        ? 'bg-blue-500/10 border border-blue-500/20'
                        : 'bg-background border'
                  "
                >
                  <div class="flex items-center justify-between gap-3 mb-1">
                    <span class="text-xs font-medium opacity-80">
                      {{
                        getUserFullName(message.author) || message.author?.email
                      }}
                      <span
                        v-if="
                          message.messageType === 'support' &&
                          !isMyMessage(message)
                        "
                        class="ml-1 text-blue-500"
                        >(поддержка)</span
                      >
                    </span>
                    <span class="text-xs opacity-60">
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
              class="flex flex-col items-center justify-center h-32"
            >
              <MessageSquare class="h-10 w-10 mb-2 text-muted-foreground/40" />
              <p class="text-sm text-muted-foreground">Нет сообщений</p>
            </div>
          </div>
        </div>

        <!-- Message input -->
        <div
          v-if="selectedTicket.status !== 'closed'"
          class="border-t p-3 flex-shrink-0 bg-muted/20"
        >
          <div v-if="photoPreviews.length" class="flex gap-2 mb-2 flex-wrap">
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
              class="h-9 w-9 flex-shrink-0"
              :disabled="sending"
              @click="fileInputRef?.click()"
            >
              <Paperclip :size="15" />
            </Button>
            <Textarea
              v-model="newMessage"
              placeholder="Ответ пользователю... (Ctrl+Enter для отправки)"
              class="resize-none bg-background min-h-9 max-h-32"
              @keydown.ctrl.enter="sendMessage"
            />
            <Button
              size="icon"
              class="h-9 w-9 flex-shrink-0"
              :disabled="
                sending || (!newMessage.trim() && !selectedPhotos.length)
              "
              @click="sendMessage"
            >
              <Send v-if="!sending" :size="15" />
              <Loader2 v-else :size="15" class="animate-spin" />
            </Button>
          </div>
        </div>

        <div
          v-else
          class="border-t p-3 text-center text-xs text-muted-foreground flex-shrink-0 bg-muted/20"
        >
          <CheckCircle2 :size="14" class="inline mr-1" />
          Тикет закрыт. Переписка завершена.
        </div>
      </template>

      <!-- Empty state -->
      <div v-else class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <MessageSquare
            class="h-12 w-12 mx-auto mb-3 text-muted-foreground/30"
          />
          <h3 class="text-base font-medium mb-1 text-muted-foreground">
            Выберите тикет
          </h3>
          <p class="text-sm text-muted-foreground">
            Кликните на тикет слева, чтобы открыть переписку
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
