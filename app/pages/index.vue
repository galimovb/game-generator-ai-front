<script setup lang="ts">
import {
  Gamepad2,
  Sparkles,
  Users,
  Clock,
  MapPin,
  Zap,
  ChevronRight,
  Star,
} from "lucide-vue-next";

const { get } = useApi();
const { $toast } = useNuxtApp();

const popularGames = ref<Game[]>([]);
const loadingGames = ref(true);

const features = [
  {
    icon: Sparkles,
    title: "AI-генерация",
    description:
      "Создавайте уникальные игры с помощью искусственного интеллекта за секунды",
  },
  {
    icon: Users,
    title: "Любое количество",
    description: "Игры для 1 до 500 участников любого возраста",
  },
  {
    icon: Clock,
    title: "Быстрый старт",
    description: "От идеи до готовой игры за пару минут",
  },
  {
    icon: MapPin,
    title: "Любая локация",
    description: "В помещении, на улице или комбинированный формат",
  },
  {
    icon: Zap,
    title: "Разный уровень",
    description: "От спокойных до максимально активных игр",
  },
  {
    icon: Star,
    title: "Готовые сценарии",
    description: "Публичная библиотека игр от сообщества",
  },
];

const loadPopularGames = async () => {
  loadingGames.value = true;
  try {
    const response = await get("/games", {
      query: { page: 1, limit: 3 },
    });
    popularGames.value = response.result.items;
  } catch (err) {
    // silently fail on main page
  } finally {
    loadingGames.value = false;
  }
};

onMounted(() => {
  loadPopularGames();
});
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)]">
    <section class="py-12 md:py-20 lg:py-28 px-4">
      <div class="container mx-auto text-center max-w-3xl">
        <div class="flex items-center justify-center gap-2 mb-6">
          <Gamepad2 :size="40" class="text-primary" />
          <h2 class="text-2xl font-bold">Игротека AI</h2>
        </div>

        <h1
          class="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
        >
          Создавайте уникальные игры
          <span class="text-primary">за секунды</span>
        </h1>

        <p class="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Опишите параметры — AI сгенерирует полноценный сценарий с этапами,
          заданиями и реквизитом. Идеально для педагогов, аниматоров и
          организаторов мероприятий.
        </p>

        <div
          class="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" as-child>
            <NuxtLink to="/games/my">
              Создать игру
              <ChevronRight :size="18" class="ml-1" />
            </NuxtLink>
          </Button>
          <Button size="lg" variant="outline" as-child>
            <NuxtLink to="/games">Каталог игр</NuxtLink>
          </Button>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-16 px-4 border-t">
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center mb-10">Возможности</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            v-for="feature in features"
            :key="feature.title"
            class="border hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div
                class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2"
              >
                <component :is="feature.icon" :size="20" class="text-primary" />
              </div>
              <CardTitle class="text-base">{{ feature.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">
                {{ feature.description }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <section
      v-if="popularGames.length || loadingGames"
      class="py-12 md:py-16 px-4 border-t"
    >
      <div class="container mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold">Популярные игры</h2>
          <Button variant="ghost" as-child>
            <NuxtLink to="/games">
              Все игры
              <ChevronRight :size="16" />
            </NuxtLink>
          </Button>
        </div>

        <div v-if="loadingGames" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card v-for="i in 3" :key="i">
            <CardHeader>
              <Skeleton class="h-48 w-full rounded-lg" />
              <Skeleton class="h-5 w-2/3 mt-4" />
              <Skeleton class="h-4 w-full" />
            </CardHeader>
          </Card>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            v-for="game in popularGames"
            :key="game.id"
            class="cursor-pointer hover:shadow-lg transition-shadow"
            @click="goToGame(game.id)"
          >
            <CardHeader>
              <div v-if="game.photos?.length" class="relative">
                <img
                  :src="getPhotoUrl(game.photos[0])"
                  class="w-full h-48 object-cover rounded-lg border"
                />
              </div>
              <div
                v-else
                class="flex justify-center items-center w-full h-48 bg-muted rounded-lg border"
              >
                <Gamepad2 :size="48" class="text-muted-foreground" />
              </div>
              <CardTitle class="mt-4">{{
                game.title || "Без названия"
              }}</CardTitle>
              <CardDescription class="line-clamp-2">{{
                game.description || "Нет описания"
              }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <span>{{ game.age }} лет</span>
                <span>·</span>
                <span>{{ game.players }} чел</span>
                <span>·</span>
                <span>{{ game.duration }} мин</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <section class="py-12 md:py-16 px-4 border-t">
      <div class="container mx-auto max-w-2xl text-center">
        <h2 class="text-2xl font-bold mb-4">Как это работает?</h2>
        <p class="text-muted-foreground mb-8">
          Три простых шага до готовой игры
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-3">
            <div
              class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto"
            >
              1
            </div>
            <h3 class="font-semibold">Укажите параметры</h3>
            <p class="text-sm text-muted-foreground">
              Возраст, количество игроков, длительность, локацию
            </p>
          </div>
          <div class="space-y-3">
            <div
              class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto"
            >
              2
            </div>
            <h3 class="font-semibold">AI генерирует</h3>
            <p class="text-sm text-muted-foreground">
              Нейросеть создаст полный сценарий с этапами и задачами
            </p>
          </div>
          <div class="space-y-3">
            <div
              class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto"
            >
              3
            </div>
            <h3 class="font-semibold">Играйте!</h3>
            <p class="text-sm text-muted-foreground">
              Редактируйте, делитесь и проводите игры
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
