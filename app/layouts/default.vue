<script setup lang="ts">
</script>

<template>
  <SidebarProvider :default-open="true">
    <AppSidebar/>
    <SidebarInset>
      <div class="flex-1">
        <SidebarTrigger class="absolute left-2 top-2"/>
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
