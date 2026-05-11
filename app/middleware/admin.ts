export default defineNuxtRouteMiddleware(async () => {
  const profileStore = useProfileStore();

  if (!profileStore.profile) {
    try {
      await profileStore.fetchProfile();
    } catch {
      return navigateTo("/login");
    }
  }

  if (!profileStore.profile) {
    return navigateTo("/login");
  }

  const hasAccess = profileStore.profile.roles.some(
    (role) => role === "ROLE_ADMIN" || role === "ROLE_SUPPORT",
  );

  if (!hasAccess) {
    return navigateTo("/");
  }
});
