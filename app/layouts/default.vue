<script setup lang="ts">
import { Menu } from 'lucide-vue-next'
</script>

<template>
  <SidebarProvider default-open>
    <AppSidebar/>
    <SidebarInset>
      <header class="bg-muted border-b shadow-lg md:hidden sticky top-0 left-0 px-2 py-1">
        <div class="flex items-center justify-between">
          <span>Лого</span>
          <SidebarTrigger :icon="Menu"/>
        </div>
      </header>
      <div class="flex-1">
        <div class="absolute left-2 top-2 hidden md:block">
          <SidebarTrigger/>
        </div>
        <slot />
      </div>
      <footer class="border-t py-4 text-center text-sm text-muted-foreground">
        <div class="container mx-auto px-4">
          © 2026 Game Generator
        </div>
      </footer>
    </SidebarInset>
  </SidebarProvider>
</template>
