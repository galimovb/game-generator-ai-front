<script setup lang="ts">
import { Settings, Moon, Sun } from 'lucide-vue-next'
import { watchDebounced } from "@vueuse/core";

const appData = useAppData()
const { states, updateSettings } = useSettingsStore()
const { fontSize, radius, color, isDarkTheme } = storeToRefs(appData)
const { setTheme, setFont, setRadius, setColor, availableColors, availableFontSize, availableRadius } = appData

const open = ref<boolean>(false)
const creativityValue = ref<number>([states.settings.generationCreative])
const modelValue = ref<ModelType>(states.settings.generationModel)

//TODO - фикс на получение с апи
const modelTypes = [
  { value: 'qwen/qwen2.5-vl-7b-instruct', label: 'Qwen2.5-VL 7B (Быстрая)' },
  { value: 'qwen/qwen3-vl-8b-instruct', label: 'Qwen3-VL 8B (Сбалансированная)'  },
  { value: 'qwen/qwen3-vl-8b-thinking', label: 'Qwen3-VL 8B Thinking (Качественная)' }
]

// Синхронизация из стора
watch(() => states.settings.generationCreative, (val) => {
  creativityValue.value = [val]
})

watch(() => states.settings.generationModel, (val) => {
  modelValue.value = val
})

// Дебаунс сохранения обоих параметров
watchDebounced([creativityValue, modelValue], async ([creativity, model]) => {
  await updateSettings({
    generationCreative: creativity[0],
    generationModel: model
  })
}, { debounce: 200 })
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
      <Accordion type="multiple" class="w-full" :default-value="['generation', 'design']">
        <AccordionItem value="generation">
          <AccordionTrigger class="text-lg text-primary">Генерация</AccordionTrigger>
          <AccordionContent class="space-y-4 px-0.5">
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Модель</h5>
              <Select v-model="modelValue">
                <SelectTrigger>
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="model in modelTypes" :value="model.value">{{model.label}}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between">
                <h5 class="text-sm font-medium leading-none">Креативность</h5>
                <span class="text-sm text-muted-foreground">{{ Math.round(creativityValue[0] * 100) }}%</span>
              </div>
              <Slider v-model="creativityValue" :min="0" :max="1" :step="0.05" />
              <div class="flex justify-between text-xs text-muted-foreground">
                <span> Предсказуемая </span>
                <span> Сбалансированная </span>
                <span> Неожиданная </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="design">
          <AccordionTrigger class="text-lg text-primary">Дизайн</AccordionTrigger>
          <AccordionContent class="space-y-4 px-0.5">
            <!-- Цвета -->
            <div class="space-y-2">
              <h5 class="text-sm font-medium leading-none">Цвета</h5>
              <div class="grid grid-cols-3 gap-2">
                <div
                    v-for="(col, idx) in availableColors"
                    :key="`preview-${idx}`"
                    :class="['border border-border rounded-md p-2 hover:border-primary space-y-2 cursor-pointer transition-all', {
                    'ring-2 ring-primary': color === col.value,
                    'dark': isDarkTheme,
                    'light': !isDarkTheme,
                  }]"
                    :data-theme="col.value"
                    @click="setColor(col.value)"
                >
                  <div class="space-y-2 theme-preview">
                    <p class="text-sm font-medium text-foreground">
                      {{ col.description }}
                    </p>
                    <div class="flex items-center gap-2">
                      <div class="h-5 w-5 rounded-full bg-primary"/>
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
                    variant="outline"
                    size="sm"
                    v-for="value in availableRadius"
                    :key="value"
                    class="aria-checked:ring-2 aria-checked:ring-foreground"
                    @click="setRadius(value)"
                    :aria-checked="radius === value"
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
                    variant="outline"
                    size="sm"
                    v-for="value in availableFontSize"
                    :key="value"
                    class="aria-checked:ring-2 aria-checked:ring-foreground"
                    @click="setFont(value)"
                    :aria-checked="fontSize === value"
                >
                  <span class="text-sm text-muted-foreground">{{ value }}px</span>
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
                    @click="setTheme('light')"
                    :aria-checked="!isDarkTheme"
                >
                  <Sun class="w-5 h-5 fill-yellow-600 stroke-yellow-600 mr-1" />
                  <span class="text-sm text-muted-foreground">Светлая</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    class="aria-checked:ring-2 aria-checked:ring-foreground px-1 justify-start"
                    @click="setTheme('dark')"
                    :aria-checked="isDarkTheme"
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
