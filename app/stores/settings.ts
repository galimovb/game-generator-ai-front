export const useSettingsStore = defineStore("settings", () => {
  const { get, patch } = useApi();
  const { $toast } = useNuxtApp();
  const { getErrorMessage } = useErrorHandler()

  const states = reactive({
    settings: {
      generationModel: "qwen/qwen3.6-plus",
      generationCreative: 0.7,
    } as UserSettings,
    loading: false as boolean,
    isLoaded: false as boolean,
    error: null as string | null,
  });

  async function fetchSettings() {
    states.loading = true;
    states.error = null;
    try {
      const { result } = await get<SingleResponse<UserSettings>>(
        "/users/profile/settings",
      );
      states.settings = result;
      states.isLoaded = true;
    } catch (err) {
      states.error = getErrorMessage(err);
    } finally {
      states.loading = false;
    }
  }

  async function updateSettings(data: Partial<UserSettings>) {
    if (states.loading) return;

    states.loading = true;
    states.error = null;
    try {
      const { result } = await patch<SingleResponse<UserSettings>>(
        "/users/profile/settings",
        data,
      );
      Object.assign(states.settings, result);
    } catch {
      $toast.error("Ошибка обновления настроек", {
        action: {
          label: "Повторить",
          onClick: () => updateSettings(data),
        },
      });
    } finally {
      states.loading = false;
    }
  }

  function reset() {
    states.isLoaded = false;
    states.settings = {
      generationModel: "qwen/qwen3.6-plus",
      generationCreative: 0.7,
    } as UserSettings;
  }

  return {
    states,
    fetchSettings,
    updateSettings,
    reset,
  };
});
