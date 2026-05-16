<script setup lang="ts">
import {
  Inbox,
  Headset,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  UserPen,
  ShieldCheck,
} from "lucide-vue-next";

const profileStore = useProfileStore();
const { logout } = profileStore;
const { profile, isAdminOrSupport } = storeToRefs(profileStore);

const gamesGroup = {
  title: "Игры",
  icon: Inbox,
  items: [
    {
      title: "Мои",
      url: "/games/my",
    },
    {
      title: "Публичные",
      url: "/games",
    },
    {
      title: "Избранные",
      url: "/games/favorites",
    },
  ],
};

const secondGroup = computed(() => [
  isAdminOrSupport.value
    ? { title: "Админ панель", url: "/admin", icon: ShieldCheck }
    : { title: "Поддержка", url: "/support", icon: Headset },
  { title: "Профиль", url: "/profile", icon: UserPen },
]);
</script>

<template>
  <Sidebar>
    <SidebarHeader class="flex-row justify-between py-3 px-3.5">
      <AppIcon />
      <SidebarTrigger class="md:hidden" />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible default-open>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton>
                    <component :is="gamesGroup.icon" />
                    <span>{{ gamesGroup.title }}</span>
                    <ChevronDown
                      class="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                    />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem
                      v-for="item in gamesGroup.items"
                      :key="item.title"
                    >
                      <SidebarMenuSubButton as-child>
                        <NuxtLink
                          :to="item.url"
                          active-class="bg-sidebar-accent"
                        >
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
            <AppSettings />
            <SidebarMenuItem v-for="item in secondGroup" :key="item.title">
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
        <DropdownMenuTrigger
          class="flex gap-2 items-center hover:bg-sidebar-accent rounded-md p-1"
        >
          <User :show-name="false" :user="profile" :size="9" />
          <div class="flex-1 grid text-sm text-left">
            <span class="truncate font-medium"
              >{{ profile?.name }} {{ profile?.lastName }}</span
            >
            <span class="truncate">{{ profile?.email }}</span>
          </div>
          <ChevronsUpDown :size="16" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem @click="logout">
            <LogOut />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  </Sidebar>
</template>
