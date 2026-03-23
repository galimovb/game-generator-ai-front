<script setup lang="ts">

const { fontSize, radius, color, isDarkTheme } = storeToRefs(useAppData())
useHead({
  htmlAttrs: {
    class: isDarkTheme.value ? 'dark' : 'light',
    'data-theme': color.value,
    'data-radius': radius.value,
    'data-font': fontSize.value
  }
})

const profileStore = useProfileStore()
const settingsStore = useSettingsStore()

await profileStore.fetchProfile()
await settingsStore.fetchSettings()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
