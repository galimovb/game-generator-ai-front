<script setup lang="ts">
import { Headset } from "lucide-vue-next";

definePageMeta({ layout: "admin", middleware: "admin" });

const api = useApi();

const countedStatuses = Object.keys(ticketStatusConfig) as const;
type CountedStatus = (typeof countedStatuses)[number];

const counts = ref<Record<CountedStatus, number>>({
  open: 0,
  in_progress: 0,
  waiting_for_user: 0,
  closed: 0,
});

const loading = ref(true);

onMounted(async () => {
  try {
    await Promise.all(
      countedStatuses.map(async (status) => {
        const res = await api.get(`/tickets?page=1&limit=1&status=${status}`);
        counts.value[status] = res.result?.pagination?.total ?? 0;
      }),
    );
  } finally {
    loading.value = false;
  }
});

const cards = computed(() =>
  countedStatuses.map((status) => ({
    title: ticketStatusConfig[status].label,
    value: counts.value[status],
    icon: ticketStatusConfig[status].icon,
    color: ticketStatusConfig[status].color,
    href: `/admin/tickets?status=${status}`,
  })),
);
</script>

<template>
  <div class="py-8 px-6 max-w-5xl mx-auto">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Дашборд</h1>
      <p class="text-muted-foreground text-sm mt-1">Обзор обращений пользователей</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink v-for="card in cards" :key="card.title" :to="card.href">
        <Card class="hover:shadow-md transition-shadow cursor-pointer h-full">
          <CardContent class="p-5">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm text-muted-foreground">{{ card.title }}</span>
              <component :is="card.icon" :size="18" :class="card.color" />
            </div>
            <div v-if="loading">
              <Skeleton class="h-8 w-12" />
            </div>
            <p v-else class="text-3xl font-bold">{{ card.value }}</p>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>

    <div class="mt-8 flex items-center gap-3">
      <NuxtLink to="/admin/tickets">
        <Button class="gap-2">
          <Headset :size="16" />
          Перейти к тикетам
        </Button>
      </NuxtLink>
    </div>
  </div>
</template>
