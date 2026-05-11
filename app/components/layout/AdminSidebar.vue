<script setup lang="ts">
import { LayoutDashboard, Headset, ChevronsUpDown, LogOut, Shield } from "lucide-vue-next";

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);

const navItems = [
  { title: "Дашборд", url: "/admin", icon: LayoutDashboard },
  { title: "Тикеты", url: "/admin/tickets", icon: Headset },
];

const logout = async () => {
  const { post } = useApi();
  try {
    await post("/auth/logout");
  } finally {
    await navigateTo("/login");
  }
};
</script>

<template>
  <Sidebar>
    <SidebarHeader class="flex-row justify-between py-3 px-2">
      <div class="flex items-center gap-1.5">
        <Shield :size="22" class="text-primary" />
        <span class="font-semibold text-sm">Поддержка</span>
      </div>
      <SidebarTrigger class="md:hidden" />
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in navItems" :key="item.title">
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
          <User :show-name="false" :user="profile" :size="9" />
          <div class="flex-1 grid text-sm text-left">
            <span class="truncate font-medium">{{ profile?.name }} {{ profile?.lastName }}</span>
            <span class="truncate text-muted-foreground">{{ profile?.email }}</span>
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
