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

const { $toast } = useNuxtApp();
const { post } = useApi();

const loginSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "Обязательное поле")
      .email("Введите корректный email"),
    password: z.string().min(1, "Обязательное поле"),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const loading = ref(false);

const onSubmit = handleSubmit(async (formValues) => {
  loading.value = true;

  try {
    await post("/auth/login", {
      email: formValues.email,
      password: formValues.password,
    });

    await navigateTo("/games/my");
  } catch (err) {
    $toast.error("Ошибка при входе");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-center">Войти</CardTitle>
      </CardHeader>
      <CardContent class="pb-2">
        <form @submit.prevent="onSubmit" class="space-y-2">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Почта</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="m@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <div class="flex items-center">
                <FormLabel>Пароль</FormLabel>
                <a href="#" class="ml-auto inline-block text-sm underline"
                  >Забыли пароль?</a
                >
              </div>
              <FormControl>
                <Input v-bind="componentField" type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          <Button type="submit" class="w-full mt-4" :disabled="loading">
            <Loader v-if="loading" class="animate-spin mr-2" />
            Войти
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
        <p class="text-sm text-muted-foreground">
          Нет аккаунта?
          <Button variant="link" class="px-0">
            <NuxtLink to="/register">Регистрация</NuxtLink>
          </Button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
