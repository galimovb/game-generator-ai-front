<script setup lang="ts">
import { Camera, Loader, Plus, X } from "lucide-vue-next";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "~/components/ui/form";
import { Label } from "~/components/ui/label";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "created"): void;
}>();

const { post } = useApi();
const { $toast } = useNuxtApp();

const gameSchema = toTypedSchema(
  z.object({
    age: z
      .number({ message: "Обязательное поле" })
      .min(3, "Минимум 3")
      .max(80, "Максимум 80"),
    players: z
      .number({ message: "Обязательное поле" })
      .min(1, "Минимум 1")
      .max(500, "Максимум 500"),
    duration: z
      .number({ message: "Обязательное поле" })
      .min(5, "Минимум 5 мин")
      .max(480, "Максимум 480 мин"),
    locationType: z.string({ message: "Обязательное поле" }),
    fieldWidth: z
      .number({ message: "Обязательное поле" })
      .min(1, "Минимум 1")
      .max(1000, "Максимум 1000"),
    fieldLength: z
      .number({ message: "Обязательное поле" })
      .min(1, "Минимум 1")
      .max(1000, "Максимум 1000"),
    activityLevel: z.string({ message: "Обязательное поле" }),
    locationDescription: z.string().optional(),
    photos: z.array(z.string()).optional(),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: gameSchema,
  initialValues: {
    age: 8,
    players: 12,
    duration: 60,
    locationType: "outdoor",
    fieldWidth: 20,
    fieldLength: 20,
    activityLevel: "medium",
    locationDescription: "",
  },
});

const requisites = ref<string[]>([]);
const newRequisite = ref("");
const photos = ref<string[]>([]);
const photoPreviews = ref<string[]>([]);
const uploadError = ref("");
const isCreating = ref(false);

const addRequisite = () => {
  if (newRequisite.value.trim()) {
    requisites.value.push(newRequisite.value.trim());
    newRequisite.value = "";
  }
};

const removeRequisite = (index: number) => {
  requisites.value.splice(index, 1);
};

const handlePhotoSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  for (const file of Array.from(input.files)) {
    if (!file.type.startsWith("image/")) {
      uploadError.value = "Можно загружать только изображения";
      continue;
    }

    if (file.size > 10 * 1024 * 1024) {
      uploadError.value = "Размер файла не должен превышать 10MB";
      continue;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      photoPreviews.value.push(base64);
      photos.value.push(base64);
    };
    reader.readAsDataURL(file);
  }
  input.value = "";
};

const removePhoto = (index: number) => {
  photoPreviews.value.splice(index, 1);
  photos.value.splice(index, 1);
};

const onSubmit = handleSubmit(async (formValues) => {
  if (photos.value.length === 0 && !formValues.locationDescription?.trim()) {
    $toast.error(
      "Если вы не прикрепили фото местности, обязательно укажите описание местности для учета ландшафта",
    );
    return;
  }
  try {
    isCreating.value = true;

    const body: Record<string, any> = {
      age: formValues.age,
      players: formValues.players,
      duration: formValues.duration,
      locationType: formValues.locationType,
      fieldWidth: formValues.fieldWidth,
      fieldLength: formValues.fieldLength,
      activityLevel: formValues.activityLevel,
      photos: photos.value,
      requisites: requisites.value.length > 0 ? requisites.value : undefined,
    };

    if (
      formValues.locationDescription &&
      formValues.locationDescription.length >= 10
    ) {
      body.locationDescription = formValues.locationDescription;
    }

    await post("/games/generate", body);
    emit("created");
    resetFormAndState();
    emit("update:open", false);
    $toast.success("Игра успешно создана");
  } catch {
    $toast.error("Ошибка создания игры", {
      action: {
        label: "Повторить",
        onClick: () => onSubmit(),
      },
    });
  } finally {
    isCreating.value = false;
  }
});

const resetFormAndState = () => {
  resetForm();
  requisites.value = [];
  photos.value = [];
  photoPreviews.value = [];
  uploadError.value = "";
  newRequisite.value = "";
};

const onClose = () => {
  if (isCreating.value) return;
  resetFormAndState();
  emit("update:open", false);
};
</script>

<template>
  <Dialog :open="open" @update:open="onClose">
    <DialogContent
      class="max-w-2xl max-h-[90vh] overflow-y-auto"
      :disable-outside-pointer-events="isCreating"
    >
      <DialogHeader>
        <DialogTitle>Создание новой игры</DialogTitle>
        <DialogDescription>
          Заполните параметры игры и загрузите фото местности
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4 py-4" @submit.prevent="onSubmit">
        <!-- Фото -->
        <div class="flex justify-center mb-4">
          <div class="flex flex-wrap gap-2 justify-center max-w-md">
            <div
              v-for="(preview, index) in photoPreviews"
              :key="index"
              class="relative w-24 h-24 border rounded-md overflow-hidden"
            >
              <img
                :src="preview"
                class="w-full h-full object-cover"
                alt="Preview"
              >
              <button
                class="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs hover:opacity-80"
                @click="removePhoto(index)"
              >
                <X :size="10" />
              </button>
            </div>

            <label
              class="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <Camera class="w-6 h-6" />
              <span class="text-xs mt-1">Добавить</span>
              <input
                type="file"
                multiple
                accept="image/*"
                class="hidden"
                @change="handlePhotoSelect"
              >
            </label>
          </div>
        </div>

        <!-- Возраст и игроки -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="age">
            <FormItem>
              <FormLabel>Возраст</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  :min="3"
                  :max="80"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="players">
            <FormItem>
              <FormLabel>Количество игроков</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  :min="1"
                  :max="500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Уровень активности -->
          <FormField v-slot="{ componentField }" name="activityLevel">
            <FormItem>
              <FormLabel>Уровень активности</FormLabel>
              <Select v-bind="componentField">
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите уровень" />
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
              <FormMessage />
            </FormItem>
          </FormField>
          <!-- Длительность -->
          <FormField v-slot="{ componentField }" name="duration">
            <FormItem>
              <FormLabel>Длительность (минут)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  :min="5"
                  :max="480"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Тип локации -->
        <FormField v-slot="{ componentField }" name="locationType">
          <FormItem>
            <FormLabel>Тип локации</FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
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
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Размеры площадки -->
        <div class="grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="fieldWidth">
            <FormItem>
              <FormLabel>Ширина площадки (м)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  :min="1"
                  :max="1000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="fieldLength">
            <FormItem>
              <FormLabel>Длина площадки (м)</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  :min="1"
                  :max="1000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <!-- Описание локации -->
        <FormField v-slot="{ componentField }" name="locationDescription">
          <FormItem>
            <FormLabel>Описание локации</FormLabel>
            <FormControl>
              <Textarea
                v-bind="componentField"
                rows="3"
                placeholder="Опишите место проведения игры"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div class="space-y-2">
          <div
            class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
          >
            <Label>Реквизит</Label>
            <div class="flex gap-2">
              <Input
                v-model="newRequisite"
                placeholder="Название"
                class="w-40"
                @keyup.enter="addRequisite"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click="addRequisite"
              >
                <Plus :size="14" />
              </Button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <div
              v-for="(item, index) in requisites"
              :key="index"
              class="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
            >
              <span>{{ item }}</span>
              <button
                class="text-muted-foreground hover:text-foreground ml-1"
                @click="removeRequisite(index)"
              >
                <X :size="12" />
              </button>
            </div>
            <span
              v-if="!requisites.length"
              class="text-sm text-muted-foreground"
              >Нет реквизита</span
            >
          </div>
        </div>

        <!-- Кнопки -->
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            :disabled="isCreating"
            @click="onClose"
            >Отмена</Button
          >
          <Button type="submit" :disabled="isCreating">
            <Loader v-if="isCreating" :size="16" class="animate-spin mr-2" />
            Создать
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
