<script setup lang="ts">
import {
  ChevronRight,
  Zap,
  Users,
  MapPin,
  ListChecks,
  Trophy,
  BookOpen,
  Flame,
} from "lucide-vue-next";

definePageMeta({ layout: false });

const {
  games: popularGames,
  loading: loadingGames,
  limit,
} = useGamesList({ endpoint: "/games/popular", key: "popular-games" });
limit.value = 3;

const features = [
  {
    icon: Zap,
    title: "Сценарий за 30 секунд",
    description:
      "Опишите параметры — AI выдаст готовую игру с этапами и заданиями",
  },
  {
    icon: Users,
    title: "От 3 до 17 лет",
    description: "Сценарий адаптируется под возраст: от малышей до подростков",
  },
  {
    icon: Flame,
    title: "Уровень активности",
    description:
      "Выберите от спокойных настольных до максимально подвижных игр",
  },
  {
    icon: MapPin,
    title: "Любая площадка",
    description:
      "Зал, улица, лес, корпоративное пространство — с учётом размеров",
  },
  {
    icon: ListChecks,
    title: "Список реквизита",
    description:
      "Каждый сценарий включает полный список необходимого инвентаря",
  },
  {
    icon: BookOpen,
    title: "Библиотека сценариев",
    description: "Сохраняйте, публикуйте и используйте игры сообщества",
  },
];

const steps = [
  {
    n: 1,
    icon: Users,
    title: "Укажите параметры",
    text: "Возраст детей, количество участников, длительность и площадку",
  },
  {
    n: 2,
    icon: Zap,
    title: "AI генерирует",
    text: "Нейросеть создаст полный сценарий с этапами, заданиями и реквизитом",
  },
  {
    n: 3,
    icon: Trophy,
    title: "Проводите игру",
    text: "Редактируйте под себя, делитесь с коллегами и запускайте мероприятие",
  },
];

const stats = [
  { value: "3–17 лет", label: "возраст участников" },
  { value: "до 500", label: "детей в одной игре" },
  { value: "30 сек", label: "до готового сценария" },
];
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div
        class="container mx-auto px-4 h-14 flex items-center justify-between"
      >
        <AppIcon />
        <Button size="sm" as-child>
          <NuxtLink to="/games">
            Открыть приложение
            <ChevronRight :size="16" />
          </NuxtLink>
        </Button>
      </div>
    </header>

    <main class="flex-1">
      <!-- Hero -->
      <section class="py-16 md:py-24 lg:py-32 px-4">
        <div class="container mx-auto text-center max-w-3xl">
          <div
            class="hero-badge inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground mb-6"
          >
            <Flame :size="12" class="text-primary" />
            Генератор активных игр для детей
          </div>

          <h1
            class="hero-title text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
          >
            Активные игры для детей —
            <span class="text-primary">за минуту</span>
          </h1>

          <p
            class="hero-text text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Для педагогов, аниматоров и вожатых. Укажите возраст и количество
            детей — получите готовый сценарий с этапами, заданиями и списком
            реквизита.
          </p>

          <div
            class="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" as-child>
              <NuxtLink to="/games/my">
                Создать игру
                <ChevronRight :size="18" class="ml-1" />
              </NuxtLink>
            </Button>
            <Button size="lg" variant="outline" as-child>
              <NuxtLink to="/games">Смотреть каталог</NuxtLink>
            </Button>
          </div>
        </div>
      </section>

      <!-- Stats -->
      <section class="border-y bg-muted/30">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-3 divide-x">
            <div
              v-for="(stat, i) in stats"
              :key="stat.label"
              class="scroll-fade py-6 text-center"
              :style="{ '--stagger': `${i * 80}ms` }"
            >
              <div class="text-2xl font-bold text-primary">
                {{ stat.value }}
              </div>
              <div class="text-xs text-muted-foreground mt-0.5">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="py-16 md:py-20 px-4">
        <div class="container mx-auto">
          <div class="text-center mb-12">
            <h2 class="scroll-fade text-2xl font-bold mb-3">
              Всё что нужно для игры
            </h2>
            <p
              class="scroll-fade text-muted-foreground"
              style="--stagger: 80ms"
            >
              AI учитывает каждую деталь вашего мероприятия
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div
              v-for="(feature, i) in features"
              :key="feature.title"
              class="scroll-fade rounded-xl border p-5 hover:shadow-md transition-shadow"
              :style="{ '--stagger': `${i * 60}ms` }"
            >
              <div
                class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3"
              >
                <component :is="feature.icon" :size="18" class="text-primary" />
              </div>
              <h3 class="font-semibold mb-1.5">{{ feature.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Popular games -->
      <section
        v-if="popularGames.length || loadingGames"
        class="py-16 md:py-20 px-4 border-t"
      >
        <div class="container mx-auto">
          <div class="scroll-fade flex items-center justify-between mb-10">
            <div>
              <h2 class="text-2xl font-bold">Популярные игры</h2>
              <p class="text-muted-foreground text-sm mt-1">
                Самые любимые сценарии сообщества
              </p>
            </div>
            <Button variant="ghost" as-child>
              <NuxtLink to="/games">
                Все игры
                <ChevronRight :size="16" />
              </NuxtLink>
            </Button>
          </div>

          <div
            v-if="loadingGames"
            class="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
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
              v-for="(game, i) in popularGames"
              :key="game.id"
              class="scroll-fade cursor-pointer hover:shadow-lg transition-shadow"
              :style="{ '--stagger': `${i * 100}ms` }"
              @click="goToGame(game.id)"
            >
              <CardHeader class="p-0">
                <div
                  v-if="game.photos?.length"
                  class="overflow-hidden rounded-t-xl"
                >
                  <img
                    :src="getPhotoUrl(game.photos[0])"
                    class="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                  >
                </div>
                <div
                  v-else
                  class="flex justify-center items-center w-full h-48 bg-muted rounded-t-xl"
                >
                  <Trophy :size="40" class="text-muted-foreground/50" />
                </div>
              </CardHeader>
              <CardContent class="pt-4">
                <h3 class="font-semibold mb-1">
                  {{ game.title || "Без названия" }}
                </h3>
                <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {{ game.description || "Нет описания" }}
                </p>
                <div class="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span class="bg-muted rounded-full px-2 py-0.5"
                    >{{ game.age }}+ лет</span
                  >
                  <span class="bg-muted rounded-full px-2 py-0.5"
                    >{{ game.players }} чел</span
                  >
                  <span class="bg-muted rounded-full px-2 py-0.5"
                    >{{ game.duration }} мин</span
                  >
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <!-- How it works -->
      <section class="py-16 md:py-20 px-4 border-t bg-muted/20">
        <div class="container mx-auto max-w-3xl">
          <div class="text-center mb-12">
            <h2 class="scroll-fade text-2xl font-bold mb-3">
              Как это работает
            </h2>
            <p
              class="scroll-fade text-muted-foreground"
              style="--stagger: 80ms"
            >
              Три шага до готового мероприятия
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="(step, i) in steps"
              :key="step.n"
              class="scroll-fade text-center"
              :style="{ '--stagger': `${200 + i * 120}ms` }"
            >
              <div
                class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
              >
                <component :is="step.icon" :size="22" class="text-primary" />
              </div>
              <div
                class="text-xs font-semibold text-primary uppercase tracking-widest mb-2"
              >
                Шаг {{ step.n }}
              </div>
              <h3 class="font-semibold mb-2">{{ step.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ step.text }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="py-16 md:py-20 px-4 border-t">
        <div class="container mx-auto text-center max-w-xl">
          <h2 class="scroll-fade text-2xl font-bold mb-4">
            Попробуйте прямо сейчас
          </h2>
          <div class="scroll-fade" style="--stagger: 160ms">
            <Button size="lg" as-child>
              <NuxtLink to="/games/my">
                Создать игру
                <ChevronRight :size="18" class="ml-1" />
              </NuxtLink>
            </Button>
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t py-6 text-center text-sm text-muted-foreground">
      <div class="container mx-auto px-4">© 2026 Игротека AI</div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-badge {
  animation: fade-up 0.5s ease both;
}
.hero-title {
  animation: fade-up 0.7s ease 100ms both;
}
.hero-text {
  animation: fade-up 0.7s ease 250ms both;
}
.hero-buttons {
  animation: fade-up 0.7s ease 400ms both;
}

.scroll-fade {
  animation: fade-up 0.6s ease both;
  animation-delay: var(--stagger, 0ms);
  animation-timeline: view();
  animation-range: entry 0% entry 35%;
}
</style>
