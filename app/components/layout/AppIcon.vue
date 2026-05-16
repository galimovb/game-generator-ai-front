<script setup lang="ts">
import { Gamepad2 } from "lucide-vue-next";
</script>

<template>
  <NuxtLink to="/" class="flex items-center gap-2 select-none">
    <Gamepad2 :size="26" class="text-primary" />
    <span class="font-bold text-base tracking-tight">
      Игротека <span class="text-primary">AI</span>
    </span>
  </NuxtLink>
</template>
