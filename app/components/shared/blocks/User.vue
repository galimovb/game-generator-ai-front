<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    namePosition: "left" | "right";
    showName?: boolean;
    user: UserProfile;
    size?: number;
    nameField?: "name" | "email" | "login";
  }>(),
  {
    namePosition: "right",
    showName: true,
    size: 8,
    nameField: "name",
  },
);

const displayName = computed(() => {
  const { user, nameField } = props;
  if (!user) return "?";

  // Для поля name выводим имя и фамилию
  if (nameField === "name") {
    return getUserFullName(props.user);
  }

  const fieldValue = user[nameField];
  if (fieldValue) return fieldValue;

  return user.login || user.email || "?";
});

const avatarFallback = computed(() => {
  const { user } = props;
  const firstChar =
    user?.name?.charAt(0) || user?.login?.charAt(0) || user?.email?.charAt(0);
  return firstChar?.toUpperCase() || "?";
});

const avatarSize = computed(() => `h-${props.size} w-${props.size}`);
</script>

<template>
  <div
    class="flex gap-2 items-center"
    :class="{ 'flex-row-reverse': namePosition === 'left' }"
  >
    <span v-if="namePosition === 'left' && showName">{{ displayName }}</span>
    <Avatar :class="avatarSize" class="flex-shrink-0">
      <AvatarImage :src="getPhotoUrl(user?.avatar)" />
      <AvatarFallback>{{ avatarFallback }}</AvatarFallback>
    </Avatar>
    <span v-if="namePosition === 'right' && showName">{{ displayName }}</span>
  </div>
</template>
