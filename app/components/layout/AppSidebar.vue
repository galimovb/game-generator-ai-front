<script setup lang="ts">
import { Home, Inbox, Headset, ChevronDown } from 'lucide-vue-next'

const firstGroup = [
  {
    title: 'Главная',
    url: '/',
    icon: Home,
  }
]

const gamesGroup = {
  title: 'Игры',
  icon: Inbox,
  items: [
    {
      title: 'Мои',
      url: '/games/my',
    },
    {
      title: 'Публичные',
      url: '/games',
    },
    {
      title: 'Избранные',
      url: '/games/favorites',
    }
  ]
}

const secondGroup = [
  {
    title: 'Поддержка',
    url: '/support',
    icon: Headset,
  }
]


</script>

<template>
  <Sidebar>
    <SidebarHeader class="flex-row justify-between">
      Иконка
      <SidebarTrigger class="md:hidden"/>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in firstGroup" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url" active-class="bg-secondary">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible default-open>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <component :is="gamesGroup.icon" />
                    <span>{{ gamesGroup.title }}</span>
                    <ChevronDown class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem v-for="item in gamesGroup.items" :key="item.title">
                      <SidebarMenuSubButton as-child>
                        <NuxtLink :to="item.url" active-class="bg-secondary">
                          <span>{{ item.title }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup class="mt-auto">
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in secondGroup" :key="item.title">
              <AppSettings/>
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url" active-class="bg-secondary">
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
      карточка профиля
    </SidebarFooter>
  </Sidebar>
</template>
