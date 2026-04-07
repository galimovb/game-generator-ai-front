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

const route = useRoute()
const authPages = ['/login', '/register']

const isAuthPage = computed(() => {
  return authPages.includes(route.path)
})

if (!isAuthPage.value) {
  await Promise.all([
    profileStore.fetchProfile(),
    settingsStore.fetchSettings()
  ])
}
</script>

<template>
  <NuxtLayout>
    <Toaster :style="{ '--z-index': '9999' }" position="top-right"/>
    <NuxtPage />
  </NuxtLayout>
</template>
