<script setup lang="ts">
const { fontSize, radius, color, isDarkTheme } = storeToRefs(useAppData());
useHead({
  htmlAttrs: {
    class: isDarkTheme.value ? "dark" : "light",
    "data-theme": color.value,
    "data-radius": radius.value,
    "data-font": fontSize.value,
  },
});

</script>

<template>
  <NuxtLayout>
    <Toaster position="top-right" />
    <NuxtPage />
  </NuxtLayout>
</template>
