<template>
  <div class="min-h-screen flex flex-col">
    <!-- Хедер -->
    <header class="border-b">
      <div class="container mx-auto px-4 py-4">
        <nav class="flex gap-4">
          <NuxtLink to="/" class="hover:text-primary">Главная</NuxtLink>
          <NuxtLink to="/about" class="hover:text-primary">О нас</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Основной контент - растягивается -->
    <main class="flex-1 container mx-auto px-4 py-6">
      <NuxtPage />
    </main>

    <!-- Футер -->
    <footer class="border-t py-4 text-center text-sm text-muted-foreground">
      <div class="container mx-auto px-4">
        © 2026 Game Generator
      </div>
    </footer>
  </div>
</template>
