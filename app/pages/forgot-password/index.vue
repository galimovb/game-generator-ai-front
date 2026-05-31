<script setup lang="ts">
import { Loader } from "lucide-vue-next";
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

definePageMeta({
  layout: "auth",
});

const { post } = useApi();
const { $toast } = useNuxtApp();

const schema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "Обязательное поле")
      .email("Введите корректный email"),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: { email: "" },
});

const loading = ref(false);
const sent = ref(false);

const onSubmit = handleSubmit(async (values) => {
  loading.value = true;
  try {
    await post("/auth/forgot-password", { email: values.email });
    sent.value = true;
  } catch {
    $toast.error("Произошла ошибка, попробуйте позже");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-center">Восстановление пароля</CardTitle>
        <CardDescription class="text-center">
          {{
            sent
              ? "Если email зарегистрирован, письмо со ссылкой уже отправлено"
              : "Введите email и мы отправим ссылку для сброса пароля"
          }}
        </CardDescription>
      </CardHeader>

      <CardContent v-if="!sent" class="pb-2">
        <form class="space-y-2" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Почта</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="m@example.com"
                  :disabled="loading"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full mt-4" :disabled="loading">
            <Loader v-if="loading" class="animate-spin mr-2" :size="16" />
            Отправить ссылку
          </Button>
        </form>
      </CardContent>

      <CardFooter class="flex justify-center">
        <Button variant="link" class="px-0">
          <NuxtLink to="/login">Вернуться ко входу</NuxtLink>
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
