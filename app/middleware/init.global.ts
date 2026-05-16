const PUBLIC_PATHS = ["/", "/login", "/register"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_PATHS.includes(to.path)) return;

  const profileStore = useProfileStore();
  const settingsStore = useSettingsStore();

  const tasks: Promise<unknown>[] = [];

  if (!profileStore.isLoaded && !profileStore.loading) {
    tasks.push(profileStore.fetchProfile());
  }

  if (!settingsStore.states.isLoaded) {
    tasks.push(settingsStore.fetchSettings());
  }

  if (tasks.length) {
    await Promise.all(tasks);
  }
});
