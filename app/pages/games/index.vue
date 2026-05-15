<script setup lang="ts">
import { SlidersHorizontal, ArrowUpDown } from "lucide-vue-next";

const filters = reactive({
  minAge: undefined as number | undefined,
  maxAge: undefined as number | undefined,
  locationType: undefined as string | undefined,
  activityLevel: undefined as string | undefined,
  minPlayers: undefined as number | undefined,
  maxPlayers: undefined as number | undefined,
});

const sortValue = ref("createdAt_DESC");

const sortOptions = [
  { value: "createdAt_DESC", label: "Сначала новые" },
  { value: "createdAt_ASC", label: "Сначала старые" },
  { value: "likesCount_DESC", label: "Популярные" },
];

const query = computed(() => {
  const [sortBy, sortOrder] = sortValue.value.split("_");
  return {
    ...(filters.minAge != null ? { minAge: filters.minAge } : {}),
    ...(filters.maxAge != null ? { maxAge: filters.maxAge } : {}),
    ...(filters.locationType ? { locationType: filters.locationType } : {}),
    ...(filters.activityLevel ? { activityLevel: filters.activityLevel } : {}),
    ...(filters.minPlayers != null ? { minPlayers: filters.minPlayers } : {}),
    ...(filters.maxPlayers != null ? { maxPlayers: filters.maxPlayers } : {}),
    sortBy,
    sortOrder,
  };
});

const { games, loading, incrementComments, decrementComments, toggleLike } =
  useGamesList({
    endpoint: "/games",
    key: "games-list",
    query,
  });

const filterOpen = ref(false);

const pendingFilters = reactive({ ...filters });

function applyFilters() {
  Object.assign(filters, pendingFilters);
  filterOpen.value = false;
}

function resetFilters() {
  Object.assign(pendingFilters, {
    minAge: undefined,
    maxAge: undefined,
    locationType: undefined,
    activityLevel: undefined,
    minPlayers: undefined,
    maxPlayers: undefined,
  });
  Object.assign(filters, pendingFilters);
  filterOpen.value = false;
}

watch(filterOpen, (open) => {
  if (open) Object.assign(pendingFilters, filters);
});

const locationTypeOptions = Object.entries(gameLocationTypes).map(
  ([value, label]) => ({ value, label }),
);
const activityLevelOptions = Object.entries(activityLevels).map(
  ([value, label]) => ({ value, label }),
);

const hasActiveFilters = computed(
  () =>
    filters.minAge != null ||
    filters.maxAge != null ||
    filters.locationType != null ||
    filters.activityLevel != null ||
    filters.minPlayers != null ||
    filters.maxPlayers != null,
);
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-semibold">Список игр</h1>

      <div class="flex items-center gap-2">
        <Select v-model="sortValue">
          <SelectTrigger class="w-auto gap-2 cursor-pointer">
            <ArrowUpDown class="size-4 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="opt in sortOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>

        <Popover v-model:open="filterOpen">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              size="icon"
              :class="hasActiveFilters ? 'border-primary text-primary' : ''"
            >
              <SlidersHorizontal class="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-80 p-4" align="end">
            <p class="text-sm font-medium mb-4">Фильтры</p>

            <div class="space-y-4">
              <div>
                <Label class="text-xs text-muted-foreground mb-1.5 block"
                  >Возраст</Label
                >
                <div class="flex gap-2">
                  <Input
                    v-model.number="pendingFilters.minAge"
                    type="number"
                    placeholder="От"
                    min="0"
                  />
                  <Input
                    v-model.number="pendingFilters.maxAge"
                    type="number"
                    placeholder="До"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <Label class="text-xs text-muted-foreground mb-1.5 block"
                  >Количество игроков</Label
                >
                <div class="flex gap-2">
                  <Input
                    v-model.number="pendingFilters.minPlayers"
                    type="number"
                    placeholder="От"
                    min="1"
                  />
                  <Input
                    v-model.number="pendingFilters.maxPlayers"
                    type="number"
                    placeholder="До"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <Label class="text-xs text-muted-foreground mb-1.5 block"
                  >Место проведения</Label
                >
                <Select v-model="pendingFilters.locationType">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Любое" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in locationTypeOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label class="text-xs text-muted-foreground mb-1.5 block"
                  >Активность</Label
                >
                <Select v-model="pendingFilters.activityLevel">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Любая" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="opt in activityLevelOptions"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="flex gap-2 mt-5">
              <Button variant="outline" class="flex-1" @click="resetFilters"
                >Сбросить</Button
              >
              <Button class="flex-1" @click="applyFilters">Применить</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <GameList
      :games="games"
      :loading="loading"
      empty-text="Пока никто не выложил игру"
      @comment:created="incrementComments"
      @comment:deleted="decrementComments"
      @like:toggle="toggleLike"
    />
  </div>
</template>
