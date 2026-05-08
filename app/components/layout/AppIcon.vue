<script setup lang="ts">
import { Gamepad2 } from "lucide-vue-next";
</script>

<template>
  <NuxtLink to="/">
    <div class="flex items-center gap-1">
      <Gamepad2 :size="26" />
      <span>Игротека AI</span>
    </div>
  </NuxtLink>
</template>

<style scoped></style>
