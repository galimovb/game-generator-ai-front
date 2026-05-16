export default defineNuxtRouteMiddleware(async () => {
  const profileStore = useProfileStore();

  if (!profileStore.isLoaded && !profileStore.loading) {
    await profileStore.fetchProfile();
  }

  if (!profileStore.profile) {
    return navigateTo("/login");
  }

  return profileStore.isAdminOrSupport ? undefined : navigateTo("/games");
});
