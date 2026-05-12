<script setup lang="ts">
import { Loader2, Send, AlertCircle, Plus } from "lucide-vue-next";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useForm } from "vee-validate";

const emit = defineEmits<{
  success: [ticket: any];
}>();

const { $toast } = useNuxtApp();

const open = ref(false);
const loading = ref(false);

const ticketSchema = toTypedSchema(
  z.object({
    subject: z
      .string({ message: "Обязательное поле" })
      .min(1, "Введите тему")
      .max(255, "Максимум 255 символов"),
    description: z
      .string({ message: "Обязательное поле" })
      .min(1, "Введите описание")
      .max(5000, "Максимум 5000 символов"),
  }),
);

const { handleSubmit, resetForm } = useForm({
  validationSchema: ticketSchema,
  initialValues: {
    subject: "",
    description: "",
  },
});

const onSubmit = handleSubmit(async (formValues) => {
  loading.value = true;

  try {
    const api = useApi();

    const ticketResponse = await api.post("/tickets", {
      subject: formValues.subject,
      description: formValues.description,
    });

    const ticket = ticketResponse.data;

    await api.post(`/tickets/${ticket.id}/messages`, {
      text: formValues.description,
    });

    emit("success", ticket);
    open.value = false;
    resetForm();
  } catch (err: any) {
    $toast.error("Ошибка при создании тикета", {
      action: {
        label: "Повторить",
        onClick: () => onSubmit(),
      },
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <Button @click="open = true">
      <Plus :size="16" class="mr-2" />
      Создать
    </Button>

    <Dialog v-model:open="open">
      <DialogContent class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создание обращения</DialogTitle>
          <DialogDescription>
            Опишите вашу проблему. Сотрудник поддержки свяжется с вами в
            ближайшее время.
          </DialogDescription>
        </DialogHeader>

        <form class="space-y-4 py-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="subject">
            <FormItem>
              <FormLabel>Тема обращения</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Кратко опишите суть проблемы"
                  :disabled="loading"
                  maxlength="255"
                />
              </FormControl>
              <FormDescription
                >{{ (componentField.modelValue || "").length }}/255
                символов</FormDescription
              >
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel>Описание проблемы</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Подробно опишите ситуацию..."
                  :disabled="loading"
                  rows="5"
                  maxlength="5000"
                />
              </FormControl>
              <FormDescription
                >{{ (componentField.modelValue || "").length }}/5000
                символов</FormDescription
              >
              <FormMessage />
            </FormItem>
          </FormField>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              :disabled="loading"
              @click="open = false"
            >
              Отмена
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" :size="16" class="mr-2 animate-spin" />
              <Send v-else :size="16" class="mr-2" />
              Отправить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
