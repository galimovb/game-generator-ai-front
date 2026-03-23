<script setup lang="ts">
import { Home, Inbox, Headset, ChevronDown, ChevronsUpDown, LogOut, UserPen  } from 'lucide-vue-next'

const profileStore = useProfileStore()
const { logout } = profileStore
const { profile, avatarUrl } = storeToRefs(profileStore)
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
      Лого
      <SidebarTrigger class="md:hidden"/>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in firstGroup" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url" active-class="bg-sidebar-accent">
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
                        <NuxtLink :to="item.url" active-class="bg-sidebar-accent">
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
                <NuxtLink :to="item.url" active-class="bg-sidebar-accent">
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
      <DropdownMenu>
        <DropdownMenuTrigger class="flex gap-2 items-center hover:bg-sidebar-accent rounded-md p-1">
          <User :show-name="false" :user="profile" :size="9"/>
          <div class="flex-1 grid text-sm text-left">
            <span class="truncate font-medium">{{ profile?.name }} {{ profile?.lastName }}</span>
            <span class="truncate">{{profile?.email}}</span>
          </div>
          <ChevronsUpDown :size="16"/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem as-child>
            <NuxtLink to="/profile">
              <UserPen/>
              Профиль
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator/>
          <DropdownMenuItem @click="logout">
            <LogOut/>
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  </Sidebar>
</template>
