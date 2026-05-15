<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { PanelLeft, type LucideIcon } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
  icon?: LucideIcon;
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <component :is="icon || PanelLeft" :size="30" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
