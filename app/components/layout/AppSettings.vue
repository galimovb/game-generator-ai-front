<script setup lang="ts">
import { Settings, Moon, Sun } from 'lucide-vue-next'

const open = ref(false)

const appData = useAppData()
const { fontSize, radius, color, isDarkTheme } = storeToRefs(appData)
const { setTheme, setFont, setRadius, setColor, availableColors, availableFontSize, availableRadius } = appData
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <SidebarMenuButton>
        <Settings />
        <span>Настройки</span>
      </SidebarMenuButton>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Настройки</DialogTitle>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Цвета -->
        <div class="space-y-2">
          <h5 class="text-sm font-medium leading-none">Цвета</h5>
          <div class="grid grid-cols-3 gap-2">
            <div
                v-for="(value, key) in availableColors"
                :key="`preview-${key}`"
                :class="['border border-border rounded-md p-2 hover:border-primary space-y-2 cursor-pointer transition-all', {
                  'ring-2 ring-primary': color === key,
                  'dark': isDarkTheme,
                  'light': !isDarkTheme,
                }]"
                :data-theme="key"
                @click="setColor(key)"
            >
              <div class="space-y-2 theme-preview">
                <p class="text-sm font-medium text-foreground">
                  {{ value.label }}
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
          <h3 class="text-sm font-medium">Тема</h3>
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
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
</style>
