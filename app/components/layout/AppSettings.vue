<script setup lang="ts">
import { Settings, Moon, Sun } from "lucide-vue-next";
import { watchDebounced } from "@vueuse/core";

const appData = useAppData();
const { states, updateSettings } = useSettingsStore();
const { fontSize, radius, color, isDarkTheme } = storeToRefs(appData);
const {
  setTheme,
  setFont,
  setRadius,
  setColor,
  availableColors,
  availableFontSize,
  availableRadius,
} = appData;

const open = ref(false);

const creativityValue = computed<[number]>({
  get: () => [states.settings.generationCreative],
  set: ([val]) => {
    states.settings.generationCreative = val;
  },
});

const modelValue = computed<ModelType>({
  get: () => states.settings.generationModel,
  set: (val) => {
    states.settings.generationModel = val;
  },
});

watchDebounced(
  [
    () => states.settings.generationCreative,
    () => states.settings.generationModel,
  ],
  async ([generationCreative, generationModel]) => {
    if (!states.isLoaded) return;
    await updateSettings({ generationCreative, generationModel });
  },
  { debounce: 200 },
);
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <SidebarMenuButton>
        <Settings />
        <span>Настройки</span>
      </SidebarMenuButton>
    </DialogTrigger>
    <DialogContent class="max-h-[95vh] overflow-y-auto px-3">
      <Accordion
        type="multiple"
        class="w-full"
        :default-value="['generation', 'design']"
      >
        <AccordionItem value="generation">
          <AccordionTrigger class="text-lg text-primary"
            >Генерация</AccordionTrigger
          >
          <AccordionContent class="space-y-4 px-0.5">
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Модель</h5>
              <Select v-model="modelValue">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="model in modelTypes"
                    :key="model.value"
                    :value="model.value"
                    >{{ model.label }}</SelectItem
                  >
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between">
                <h5 class="text-sm font-medium leading-none">Креативность</h5>
                <span class="text-sm text-muted-foreground"
                  >{{ Math.round(creativityValue[0] * 100) }}%</span
                >
              </div>
              <Slider
                v-model="creativityValue"
                :min="0"
                :max="1"
                :step="0.05"
              />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span> Предсказуемая </span>
                <span> Сбалансированная </span>
                <span> Неожиданная </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="design">
          <AccordionTrigger class="text-lg text-primary"
            >Дизайн</AccordionTrigger
          >
          <AccordionContent class="space-y-4 px-0.5">
            <!-- Цвета -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Цвета</h5>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(col, idx) in availableColors"
                  :key="`preview-${idx}`"
                  :class="[
                    'border border-border rounded-md p-2 hover:border-primary space-y-2 cursor-pointer transition-all',
                    {
                      'ring-2 ring-primary': color === col.value,
                      dark: isDarkTheme,
                      light: !isDarkTheme,
                    },
                  ]"
                  :data-theme="col.value"
                  @click="setColor(col.value)"
                >
                  <div class="space-y-2 theme-preview">
                    <p class="text-sm font-medium text-foreground">
                      {{ col.description }}
                    </p>
                    <div class="flex items-center gap-2">
                      <div class="h-5 w-5 rounded-full bg-primary" />
                      <div class="h-5 w-5 rounded-full bg-secondary" />
                      <div class="h-5 w-5 rounded-full bg-accent" />
                    </div>
                    <div class="rounded-full h-3 bg-muted" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Радиус -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Радиус</h5>
              <div class="grid grid-cols-5 gap-2">
                <Button
                  v-for="value in availableRadius"
                  :key="value"
                  variant="outline"
                  size="sm"
                  class="aria-checked:ring-2 aria-checked:ring-foreground"
                  :aria-checked="radius === value"
                  @click="setRadius(value)"
                >
                  <span class="text-sm text-muted-foreground">{{ value }}</span>
                </Button>
              </div>
            </div>

            <!-- Размер шрифта -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Размер шрифта</h5>
              <div class="grid grid-cols-4 gap-2">
                <Button
                  v-for="value in availableFontSize"
                  :key="value"
                  variant="outline"
                  size="sm"
                  class="aria-checked:ring-2 aria-checked:ring-foreground"
                  :aria-checked="fontSize === value"
                  @click="setFont(value)"
                >
                  <span class="text-sm text-muted-foreground"
                    >{{ value }}px</span
                  >
                </Button>
              </div>
            </div>

            <!-- Тема -->
            <div class="space-y-3">
              <h5 class="text-sm font-medium">Тема</h5>
              <div class="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="aria-checked:ring-2 aria-checked:ring-foreground px-1 justify-start"
                  :aria-checked="!isDarkTheme"
                  @click="setTheme('light')"
                >
                  <Sun class="w-5 h-5 fill-yellow-600 stroke-yellow-600 mr-1" />
                  <span class="text-sm text-muted-foreground">Светлая</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="aria-checked:ring-2 aria-checked:ring-foreground px-1 justify-start"
                  :aria-checked="isDarkTheme"
                  @click="setTheme('dark')"
                >
                  <Moon class="w-5 h-5 stroke-current mr-1" />
                  <span class="text-sm text-muted-foreground">Тёмная</span>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DialogContent>
  </Dialog>
</template>
