export const useProfileStore = defineStore("profile", () => {
  const { get, patch } = useApi();

  const profile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);
  const uploading = ref(false);

  const avatarUrl = computed(() => {
    if (!profile.value?.avatar) return null;
    return getPhotoUrl(profile.value.avatar);
  });

  const fullName = computed(() => {
    return getUserFullName(profile.value);
  });

  const isAdminOrSupport = computed(() => {
    if (!profile.value?.roles) return false;
    return profile.value.roles.some(
      (role) => role === "ROLE_ADMIN" || role === "ROLE_SUPPORT",
    );
  });

  async function fetchProfile() {
    loading.value = true;
    error.value = null;

    try {
      const response = await get<SingleResponse<UserProfile>>("/users/profile");
      profile.value = response.result;
      isLoaded.value = true;
    } catch (err) {
      error.value = err.data?.message || "Ошибка загрузки профиля";
      console.error("Ошибка загрузки профиля", err.data);
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await patch("/users/profile", data);
      profile.value = response.result;
    } catch (err: any) {
      error.value = err.data?.message || "Ошибка обновления профиля";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadAvatar(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Допустимые форматы изображения: JPEG, PNG, WebP");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Размер файла не должен превышать 5MB");
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        uploading.value = true;
        try {
          await updateProfile({ avatar: e.target?.result as string });
          resolve(true);
        } catch (err) {
          reject(err);
        } finally {
          uploading.value = false;
        }
      };

      reader.onerror = () => reject(new Error("Ошибка чтения файла"));
      reader.readAsDataURL(file);
    });
  }

  async function logout() {
    const { post } = useApi();
    try {
      await post("/auth/logout");
      profile.value = null;
      isLoaded.value = false;
      useSettingsStore().reset();
      navigateTo("/login");
    } catch (e) {
      console.error("Ошибка выхода", e);
    }
  }

  return {
    profile,
    loading,
    isLoaded,
    error,
    uploading,
    avatarUrl,
    fullName,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    logout,
    isAdminOrSupport,
  };
});
