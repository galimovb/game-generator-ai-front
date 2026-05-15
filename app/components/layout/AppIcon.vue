<script setup lang="ts">
import { Gamepad2 } from "lucide-vue-next";
</script>

<template>
  <NuxtLink to="/">
    <div class="flex items-center gap-2">
      <Gamepad2 :size="30" class="text-primary" />
      <span class="font-bold">Игротека AI</span>
    </div>
  </NuxtLink>
</template>

<style scoped></style>
