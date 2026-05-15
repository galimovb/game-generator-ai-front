<script setup lang="ts">
import { Gamepad2, TicketCheck, LogOut, ExternalLink } from "lucide-vue-next";

const profileStore = useProfileStore();
const route = useRoute();

const navLinks = [{ label: "Тикеты", to: "/admin/tickets", icon: TicketCheck }];
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="border-b bg-background sticky top-0 z-50 h-14">
      <div
        class="container mx-auto px-4 h-full flex items-center justify-between gap-6"
      >
        <div class="flex items-center gap-6">
          <NuxtLink
            to="/admin"
            class="flex items-center gap-2 font-semibold text-sm"
          >
            <Gamepad2 :size="22" />
            <span>Админ-панель</span>
          </NuxtLink>

          <nav class="flex items-center gap-1">
            <NuxtLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-muted"
              :class="
                route.path.startsWith(link.to)
                  ? 'bg-muted font-medium'
                  : 'text-muted-foreground'
              "
            >
              <component :is="link.icon" :size="15" />
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-4">
          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Открыть пользовательский интерфейс"
          >
            <ExternalLink :size="14" />
            <span>Сайт</span>
          </NuxtLink>
          <User :user="profileStore.profile" />
          <Button
            variant="ghost"
            size="icon"
            title="Выйти"
            @click="profileStore.logout"
          >
            <LogOut :size="16" />
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 flex flex-col">
      <slot />
    </main>
  </div>
</template>
