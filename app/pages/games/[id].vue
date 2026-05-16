<script setup lang="ts">
import {
  Plus,
  Check,
  X,
  Loader,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-vue-next";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

const route = useRoute();
const { get, patch, del } = useApi();
const { $toast } = useNuxtApp();

const profileStore = useProfileStore();
const { profile } = storeToRefs(profileStore);

const game = ref<Game | null>(null);
const loading = ref(true);
const saving = ref(false);
const isLoadingError = ref(false);
const isAuthor = ref(false);
const isEditing = ref(false);
const isDeleting = ref(false);

const savingStageId = ref<number | null>(null);
const deletingStageId = ref<number | null>(null);

const editingStageId = ref<number | null>(null);
const editingStageData = ref<Required<
  Omit<Stage, "id" | "order" | "createdAt">
> | null>(null);

const newStageTask = ref("");
const newStageProp = ref("");
const addingTaskForStage = ref<number | null>(null);
const addingPropForStage = ref<number | null>(null);

const newRequisite = ref("");
const isAddingRequisit = ref(false);

const updateGameSchemaRaw = z
  .object({
    title: z
      .string()
      .min(3, "Минимум 3 символа")
      .max(255, "Максимум 255 символов")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .min(10, "Минимум 10 символов")
      .optional()
      .or(z.literal("")),
    age: z
      .number({ message: "Введите корректное количество" })
      .min(3, "Минимальный возраст 3 года")
      .max(25, "Максимальный возраст 25 лет")
      .optional(),
    players: z
      .number({ message: "Введите корректное количество" })
      .min(1, "Минимум 1 игрок")
      .max(50, "Максимум 50 игроков")
      .optional(),
    duration: z
      .number({ message: "Введите корректное количество" })
      .positive("Длительность должна быть положительной")
      .min(5, "Минимальная длительность 5 минут")
      .max(120, "Максимальная длительность 120 минут")
      .optional(),
    locationType: z.string().optional(),
    fieldWidth: z
      .number({ message: "Введите корректное количество" })
      .min(1, "Минимальная ширина 1 метр")
      .max(1000, "Максимальная ширина 1000 метров")
      .optional(),
    fieldLength: z
      .number({ message: "Введите корректное количество" })
      .min(1, "Минимальная длина 1 метр")
      .max(1000, "Максимальная длина 1000 метров")
      .optional(),
    activityLevel: z.string().optional(),
    requisites: z.array(z.string()).optional(),
    isPublic: z.boolean().optional(),
    locationDescription: z.string().optional(),
    photos: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (!data.photos || data.photos.length === 0) &&
      (!data.locationDescription || data.locationDescription.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["locationDescription"],
        message:
          "Когда фото отсутствуют, обязательно укажите описание местности",
      });
    }
  });

const gameEditSchema = toTypedSchema(updateGameSchemaRaw);

const { handleSubmit, setValues } = useForm({
  validationSchema: gameEditSchema,
});

const formRequisites = ref<string[]>([]);

const loadData = async () => {
  loading.value = true;
  isLoadingError.value = false;

  try {
    const gameId = route.params.id;
    const gameResponse = await get<SingleResponse<Game>>(`/games/${gameId}`);
    game.value = gameResponse.result;

    isAuthor.value = profile.value?.id === game.value?.author.id;

    if (game.value) {
      setValues({
        title: game.value.title || "",
        description: game.value.description || "",
        age: game.value.age || 0,
        players: game.value.players || 0,
        duration: game.value.duration || 0,
        locationType: game.value.locationType || "",
        fieldWidth: game.value.fieldWidth || 0,
        fieldLength: game.value.fieldLength || 0,
        activityLevel: game.value.activityLevel || "",
        locationDescription: game.value.locationDescription || "",
        isPublic: game.value.isPublic || false,
      });
      formRequisites.value = game.value.requisites || [];
    }
  } catch {
    $toast.error("Произошла ошибка при загрузке игры", {
      action: {
        label: "Повторить",
        onClick: () => loadData(),
      },
    });
    isLoadingError.value = true;
  } finally {
    loading.value = false;
  }
};

const startEditing = () => {
  if (game.value) {
    setValues({
      title: game.value.title || "",
      description: game.value.description || "",
      age: game.value.age || 0,
      players: game.value.players || 0,
      duration: game.value.duration || 0,
      locationType: game.value.locationType || "",
      fieldWidth: game.value.fieldWidth || 0,
      fieldLength: game.value.fieldLength || 0,
      activityLevel: game.value.activityLevel || "",
      locationDescription: game.value.locationDescription || "",
      isPublic: game.value.isPublic || false,
    });
    formRequisites.value = game.value.requisites || [];
    isEditing.value = true;
  }
};

const cancelEdit = () => {
  isEditing.value = false;
};

const addRequisite = () => {
  if (newRequisite.value.trim()) {
    formRequisites.value.push(newRequisite.value.trim());
    newRequisite.value = "";
    isAddingRequisit.value = false;
  }
};

const removeRequisite = (index: number) => {
  formRequisites.value.splice(index, 1);
};

const onSubmit = handleSubmit(async (formValues) => {
  if (!game.value) return;

  console.log(formValues);
  saving.value = true;
  try {
    const body: Record<string, any> = {
      ...formValues,
      requisites: formRequisites.value,
    };
    const response = await patch(`/games/${game.value.id}`, body);
    game.value = response.result;
    isEditing.value = false;
    $toast.success("Изменения сохранены");
  } catch {
    $toast.error("Ошибка сохранения изменений");
  } finally {
    saving.value = false;
  }
});

const startEditingStage = (stage: Stage) => {
  editingStageId.value = stage.id;
  editingStageData.value = {
    title: stage.title,
    description: stage.description,
    duration: stage.duration,
    tasks: [...stage.tasks],
    props: [...stage.props],
  };
};

const cancelEditingStage = () => {
  editingStageId.value = null;
  editingStageData.value = null;
  addingTaskForStage.value = null;
  addingPropForStage.value = null;
  newStageTask.value = "";
  newStageProp.value = "";
};

const saveStageChanges = async (stageId: number) => {
  if (!game.value || !editingStageData.value) return;

  savingStageId.value = stageId;
  try {
    const response = await patch(
      `/games/${game.value.id}/stages/${stageId}`,
      editingStageData.value,
    );
    const stageIndex = game.value.stages.findIndex((s) => s.id === stageId);
    if (stageIndex !== -1) {
      game.value.stages[stageIndex] = response.result;
    }
    cancelEditingStage();
    $toast.success("Стадия обновлена");
  } catch {
    $toast.error("Ошибка сохранения стадии");
  } finally {
    savingStageId.value = null;
  }
};

const deleteStage = async (stageId: number) => {
  deletingStageId.value = stageId;
  try {
    await del(`/games/${game.value?.id}/stages/${stageId}`);
    if (game.value) {
      game.value.stages = game.value.stages.filter((s) => s.id !== stageId);
    }
    $toast.success("Стадия удалена");
  } catch {
    $toast.error("Ошибка удаления стадии");
  } finally {
    deletingStageId.value = null;
  }
};

const deleteGame = async () => {
  try {
    isDeleting.value = true;
    await del(`/games/${game.value?.id}`);
    if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      window.location.href = "/games";
    }
  } catch {
    $toast.error("Ошибка удаления игры");
  } finally {
    isDeleting.value = false;
  }
};

const addStageTask = () => {
  if (newStageTask.value.trim() && editingStageData.value) {
    editingStageData.value.tasks.push(newStageTask.value.trim());
    newStageTask.value = "";
    addingTaskForStage.value = null;
  }
};

const removeStageTask = (taskIndex: number) => {
  if (editingStageData.value) {
    editingStageData.value.tasks.splice(taskIndex, 1);
  }
};

const addStageProp = () => {
  if (newStageProp.value.trim() && editingStageData.value) {
    editingStageData.value.props.push(newStageProp.value.trim());
    newStageProp.value = "";
    addingPropForStage.value = null;
  }
};

const removeStageProp = (propIndex: number) => {
  if (editingStageData.value) {
    editingStageData.value.props.splice(propIndex, 1);
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div class="container mx-auto py-4 md:px-2 md:py-6 lg:py-8 lg:px-4">
    <div v-if="isLoadingError" class="text-center py-12">
      <p class="text-destructive">Произошла ошибка при загрузке игры</p>
      <Button class="mt-4" @click="loadData">Повторить</Button>
    </div>

    <Card v-else>
      <CardHeader>
        <div class="flex justify-between items-start gap-4">
          <CardTitle class="md:text-xl break-words flex-1">
            <Skeleton v-if="loading" class="h-8" />
            <template v-else-if="isEditing">
              <FormField v-slot="{ componentField }" name="title">
                <FormItem>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      placeholder="Название игры"
                      :disabled="saving"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </template>
            <template v-else>{{ game?.title || "Без названия" }}</template>
          </CardTitle>

          <div v-if="!loading && isAuthor && !isEditing" class="flex gap-2">
            <Button variant="link" size="sm" @click="startEditing"
              >Изменить</Button
            >
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="hover:text-destructive"
                >
                  <Trash2 :size="16" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription
                    >Восстановить игру будет невозможно</AlertDialogDescription
                  >
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction class="bg-destructive" @click="deleteGame">
                    <Loader v-if="isDeleting" class="animate-spin" />
                    <span v-else>Удалить</span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <User
            v-if="!isAuthor && !loading"
            :user="game?.author"
            :size="9"
            name-field="email"
          />
          <Skeleton v-if="loading" class="h-10" />
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Skeleton v-if="loading" class="w-full h-64 rounded-lg" />
            <div v-else-if="game?.photos?.length" class="relative">
              <Carousel>
                <CarouselContent>
                  <CarouselItem v-for="(photo, idx) in game.photos" :key="idx">
                    <img
                      :src="getPhotoUrl(photo)"
                      class="w-full h-64 object-cover rounded-lg"
                    >
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious
                  v-if="game.photos.length > 1"
                  class="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7"
                />
                <CarouselNext
                  v-if="game.photos.length > 1"
                  class="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                />
              </Carousel>
            </div>
            <div
              v-else
              class="flex justify-center items-center w-full h-64 bg-muted rounded-lg border"
            >
              <ImageIcon :size="48" class="text-muted-foreground" />
              <p v-if="isEditing" class="text-sm ml-2">Фото нельзя изменить</p>
            </div>
          </div>

          <div class="md:col-span-2">
            <div class="grid grid-cols-2 gap-4">
              <template v-if="loading">
                <Skeleton v-for="i in 8" :key="i" class="h-8" />
              </template>

              <template v-else>
                <FormField v-slot="{ componentField }" name="age">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Возраст</FormLabel
                    >
                    <Input
                      v-if="isEditing"
                      v-bind="componentField"
                      type="number"
                      :disabled="saving"
                    />
                    <p v-else class="text-sm font-medium">
                      {{ game?.age }} лет
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="players">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Игроки</FormLabel
                    >
                    <Input
                      v-if="isEditing"
                      v-bind="componentField"
                      type="number"
                      :disabled="saving"
                    />
                    <p v-else class="text-sm font-medium">
                      {{ game?.players }} чел
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="duration">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Длительность</FormLabel
                    >
                    <Input
                      v-if="isEditing"
                      v-bind="componentField"
                      type="number"
                      :disabled="saving"
                    />
                    <p v-else class="text-sm font-medium">
                      {{ game?.duration }} мин
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="locationType">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Локация</FormLabel
                    >
                    <Select
                      v-if="isEditing"
                      v-bind="componentField"
                      :disabled="saving"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="(value, key) in gameLocationTypes"
                          :key="key"
                          :value="key"
                        >
                          {{ value }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p v-else class="text-sm font-medium">
                      {{ gameLocationTypes[game?.locationType] }}
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="fieldWidth">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Ширина площадки</FormLabel
                    >
                    <Input
                      v-if="isEditing"
                      v-bind="componentField"
                      type="number"
                      :disabled="saving"
                    />
                    <p v-else class="text-sm font-medium">
                      {{ game?.fieldWidth }} м
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="fieldLength">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Длина площадки</FormLabel
                    >
                    <Input
                      v-if="isEditing"
                      v-bind="componentField"
                      type="number"
                      :disabled="saving"
                    />
                    <p v-else class="text-sm font-medium">
                      {{ game?.fieldLength }} м
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="activityLevel">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Активность</FormLabel
                    >
                    <Select
                      v-if="isEditing"
                      v-bind="componentField"
                      :disabled="saving"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          v-for="(value, key) in activityLevels"
                          :key="key"
                          :value="key"
                        >
                          {{ value }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p v-else class="text-sm font-medium">
                      {{ activityLevels[game?.activityLevel] }}
                    </p>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>

                <FormField v-slot="{ componentField }" name="isPublic">
                  <FormItem>
                    <FormLabel class="text-xs text-muted-foreground"
                      >Статус</FormLabel
                    >
                    <div v-if="isEditing" class="flex items-center gap-2 pt-1">
                      <FormControl>
                        <Checkbox v-bind="componentField" :disabled="saving" />
                      </FormControl>
                      <Label class="text-xs">Публичная игра</Label>
                    </div>
                    <Badge
                      v-else
                      :variant="game?.isPublic ? 'default' : 'secondary'"
                      class="block w-fit"
                    >
                      {{ game?.isPublic ? "Публичная" : "Черновик" }}
                    </Badge>
                    <FormMessage v-if="isEditing" />
                  </FormItem>
                </FormField>
              </template>
            </div>
          </div>
        </div>

        <FormField v-slot="{ componentField }" name="description">
          <FormItem v-if="!loading">
            <FormLabel class="text-xs text-muted-foreground"
              >Описание</FormLabel
            >
            <Textarea
              v-if="isEditing"
              v-bind="componentField"
              rows="3"
              :disabled="saving"
              placeholder="Описание игры"
            />
            <p v-else class="text-sm">
              {{ game?.description || "Нет описания" }}
            </p>
            <FormMessage v-if="isEditing" />
          </FormItem>
          <Skeleton v-else class="h-12" />
        </FormField>

        <FormField v-slot="{ componentField }" name="locationDescription">
          <FormItem v-if="isEditing || game?.locationDescription">
            <FormLabel class="text-xs text-muted-foreground"
              >Описание локации</FormLabel
            >
            <Textarea
              v-if="isEditing"
              v-bind="componentField"
              rows="2"
              :disabled="saving"
              placeholder="Описание места проведения"
            />
            <p v-else class="text-sm">{{ game?.locationDescription || "—" }}</p>
            <FormMessage v-if="isEditing" />
          </FormItem>
        </FormField>

        <div class="space-y-1">
          <Skeleton v-if="loading" class="h-10" />
          <template v-else>
            <div class="flex items-center gap-2">
              <Label class="text-xs text-muted-foreground">Реквизит</Label>
              <Button
                v-if="isEditing"
                variant="outline"
                size="icon"
                class="h-7 w-7"
                :disabled="saving"
                @click="isAddingRequisit = !isAddingRequisit"
              >
                <Plus :size="14" />
              </Button>
            </div>

            <div
              v-if="!isEditing && game?.requisites?.length"
              class="flex flex-wrap gap-2"
            >
              <Badge
                v-for="item in game.requisites"
                :key="item"
                variant="outline"
                >{{ item }}</Badge
              >
            </div>

            <div v-if="isEditing" class="flex flex-wrap gap-2">
              <Badge
                v-for="(item, idx) in formRequisites"
                :key="idx"
                variant="outline"
              >
                {{ item }}
                <X
                  :size="12"
                  class="ml-1 cursor-pointer"
                  @click="removeRequisite(idx)"
                />
              </Badge>
              <div v-if="isAddingRequisit" class="flex gap-2">
                <Input
                  v-model="newRequisite"
                  class="w-40"
                  placeholder="Название"
                  @keyup.enter="addRequisite"
                />
                <Button size="icon" class="h-7 w-7" @click="addRequisite"
                  ><Check :size="14"
                /></Button>
              </div>
              <span
                v-if="!formRequisites.length && !isAddingRequisit"
                class="text-sm text-muted-foreground"
                >Нет реквизита</span
              >
            </div>

            <p
              v-if="!isEditing && !game?.requisites?.length"
              class="text-sm text-muted-foreground"
            >
              Нет реквизита
            </p>
          </template>
        </div>

        <div
          v-if="!isEditing && !loading && game?.stages?.length"
          class="space-y-3"
        >
          <Label class="text-xs text-muted-foreground"
            >Стадии игры ({{ game.stages.length }})</Label
          >
          <div class="grid grid-cols-1 gap-3">
            <Card
              v-for="stage in game.stages"
              :key="stage.id"
              class="p-3 md:p-5"
            >
              <CardHeader class="p-0">
                <div class="flex items-start justify-between gap-4">
                  <CardTitle
                    v-if="editingStageId !== stage.id"
                    class="break-words pr-2"
                  >
                    {{ stage.title }}
                  </CardTitle>
                  <Input
                    v-else
                    v-model="editingStageData.title"
                    placeholder="Название стадии"
                    class="flex-1"
                    :disabled="savingStageId === stage.id"
                  />

                  <div class="flex items-center gap-1">
                    <span class="text-sm text-muted-foreground"
                      >{{ stage.duration }} мин</span
                    >

                    <template v-if="editingStageId !== stage.id">
                      <Button
                        v-if="isAuthor"
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7"
                        @click="startEditingStage(stage)"
                      >
                        <Pencil :size="14" />
                      </Button>
                      <Button
                        v-if="isAuthor"
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 hover:text-destructive"
                        @click="deleteStage(stage.id)"
                      >
                        <Trash2 :size="14" />
                      </Button>
                    </template>

                    <template v-else>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7 text-primary"
                        :disabled="savingStageId === stage.id"
                        @click="saveStageChanges(stage.id)"
                      >
                        <Loader
                          v-if="savingStageId === stage.id"
                          class="w-4 h-4 animate-spin"
                        />
                        <Check v-else :size="14" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-7 w-7"
                        :disabled="savingStageId === stage.id"
                        @click="cancelEditingStage"
                      >
                        <X :size="14" />
                      </Button>
                    </template>
                  </div>
                </div>

                <CardDescription
                  v-if="editingStageId !== stage.id"
                  class="break-words mt-2"
                >
                  {{ stage.description }}
                </CardDescription>
                <Textarea
                  v-else
                  v-model="editingStageData.description"
                  placeholder="Описание стадии"
                  rows="2"
                  class="mt-2"
                  :disabled="savingStageId === stage.id"
                />

                <div
                  v-if="editingStageId === stage.id"
                  class="flex items-center gap-2 mt-2"
                >
                  <Label class="text-sm">Длительность (мин)</Label>
                  <Input
                    v-model.number="editingStageData.duration"
                    type="number"
                    min="1"
                    class="w-24"
                    :disabled="savingStageId === stage.id"
                  />
                </div>
              </CardHeader>

              <CardContent class="p-0 pt-3 space-y-2">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-medium text-muted-foreground">
                      Задания:
                    </p>
                    <Button
                      v-if="editingStageId === stage.id && isAuthor"
                      variant="outline"
                      size="icon"
                      class="h-6 w-6"
                      :disabled="savingStageId === stage.id"
                      @click="addingTaskForStage = stage.id"
                    >
                      <Plus :size="12" />
                    </Button>
                  </div>

                  <ul
                    v-if="editingStageId !== stage.id && stage.tasks?.length"
                    class="list-disc list-inside text-sm"
                  >
                    <li
                      v-for="task in stage.tasks"
                      :key="task"
                      class="break-words"
                    >
                      {{ task }}
                    </li>
                  </ul>

                  <div v-if="editingStageId === stage.id" class="space-y-1">
                    <div
                      v-for="(task, idx) in editingStageData?.tasks"
                      :key="idx"
                      class="flex items-center gap-2 group"
                    >
                      <span class="text-sm flex-1 break-words"
                        >• {{ task }}</span
                      >
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-5 w-5"
                        :disabled="savingStageId === stage.id"
                        @click="removeStageTask(idx)"
                      >
                        <X :size="12" />
                      </Button>
                    </div>
                    <div
                      v-if="addingTaskForStage === stage.id"
                      class="flex items-center gap-2 mt-1"
                    >
                      <Input
                        v-model="newStageTask"
                        placeholder="Новое задание"
                        class="flex-1"
                        :disabled="savingStageId === stage.id"
                        @keyup.enter="addStageTask"
                      />
                      <Button
                        size="icon"
                        class="h-7 w-7"
                        :disabled="savingStageId === stage.id"
                        @click="addStageTask"
                      >
                        <Check :size="14" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-medium text-muted-foreground">
                      Реквизит этапа:
                    </p>
                    <Button
                      v-if="editingStageId === stage.id && isAuthor"
                      variant="outline"
                      size="icon"
                      class="h-6 w-6"
                      :disabled="savingStageId === stage.id"
                      @click="addingPropForStage = stage.id"
                    >
                      <Plus :size="12" />
                    </Button>
                  </div>

                  <div
                    v-if="editingStageId !== stage.id && stage.props?.length"
                    class="flex flex-wrap gap-1"
                  >
                    <Badge
                      v-for="prop in stage.props"
                      :key="prop"
                      variant="outline"
                      class="text-xs"
                      >{{ prop }}</Badge
                    >
                  </div>

                  <div v-if="editingStageId === stage.id" class="space-y-1">
                    <div class="flex flex-wrap gap-1">
                      <div
                        v-for="(prop, idx) in editingStageData?.props"
                        :key="idx"
                        class="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm group"
                      >
                        <span class="break-all">{{ prop }}</span>
                        <Button
                          variant="ghost"
                          class="p-0.5 h-5 w-5 hover:text-destructive"
                          :disabled="savingStageId === stage.id"
                          @click="removeStageProp(idx)"
                        >
                          <X :size="12" />
                        </Button>
                      </div>
                      <div
                        v-if="addingPropForStage === stage.id"
                        class="flex items-center gap-2 mt-1"
                      >
                        <Input
                          v-model="newStageProp"
                          placeholder="Новый реквизит"
                          class="w-40"
                          :disabled="savingStageId === stage.id"
                          @keyup.enter="addStageProp"
                        />
                        <Button
                          size="icon"
                          class="h-7 w-7"
                          :disabled="savingStageId === stage.id"
                          @click="addStageProp"
                        >
                          <Check :size="14" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div v-if="isEditing" class="flex justify-end gap-2 pt-4">
          <Button variant="outline" @click="cancelEdit">Отмена</Button>
          <Button :disabled="saving" @click="onSubmit">
            <Loader v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
