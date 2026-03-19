<script setup lang="ts">
import { Calendar, Home, Inbox, Headset, Settings, Heart } from 'lucide-vue-next'

const firstGroup = [
  {
    title: 'Главная',
    url: '/',
    icon: Home,
  },
  {
    title: 'Мои игры',
    url: '/games/my',
    icon: Inbox,
  },
  {
    title: 'Публичные игры',
    url: '/games',
    icon: Calendar,
  },
  {
    title: 'Избранные игры',
    url: '/games',
    icon: Heart,
  },
]

const secondGroup = [
  {
    title: 'Поддержка',
    url: '/support',
    icon: Headset,
  },
  {
    title: 'Настройки',
    url: '/settings',
    icon: Settings,
  },
]
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      Иконка
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in firstGroup" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup class="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in secondGroup" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      тест
    </SidebarFooter>
  </Sidebar>
</template>
