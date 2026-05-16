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
const router = useRouter();

const registerSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .min(1, "Обязательное поле")
      .email("Введите корректный email"),
    password: z
      .string()
      .min(1, "Обязательное поле")
      .min(8, "Минимум 8 символов"),
    login: z
      .string()
      .max(255, "Максимум 255 символов")
      .optional()
      .or(z.literal("")),
    name: z
      .string()
      .max(255, "Максимум 255 символов")
      .optional()
      .or(z.literal("")),
    lastName: z
      .string()
      .max(255, "Максимум 255 символов")
      .optional()
      .or(z.literal("")),
    middleName: z
      .string()
      .max(255, "Максимум 255 символов")
      .optional()
      .or(z.literal("")),
  }),
);

const { handleSubmit } = useForm({
  validationSchema: registerSchema,
  initialValues: {
    email: "",
    password: "",
    login: "",
    name: "",
    lastName: "",
    middleName: "",
  },
});

const loading = ref(false);

const onSubmit = handleSubmit(async (formValues) => {
  loading.value = true;

  try {
    const body: UserRegister = {
      email: formValues.email,
      password: formValues.password,
      login: formValues.login || undefined,
      name: formValues.name || undefined,
      lastName: formValues.lastName || undefined,
      middleName: formValues.middleName || undefined,
    };

    await post("/auth/register", body);
    await router.push("/login");
  } catch {
    $toast.error("Ошибка при регистрации");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-2xl font-bold">Регистрация</CardTitle>
        <CardDescription>Создайте новый аккаунт</CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="ivan@example.com"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="login">
            <FormItem>
              <FormLabel>Логин</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  placeholder="ivan123"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="••••••••"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input v-bind="componentField" type="text" placeholder="Иван" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel>Фамилия</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  placeholder="Иванов"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="middleName">
            <FormItem>
              <FormLabel>Отчество</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  placeholder="Иванович"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full" :disabled="loading">
            <Loader v-if="loading" class="animate-spin mr-2" :size="16" />
            {{ loading ? "Регистрация..." : "Зарегистрироваться" }}
          </Button>
        </form>
      </CardContent>

      <CardFooter class="justify-center pb-6">
        <p class="text-sm text-muted-foreground">
          Уже есть аккаунт?
          <Button variant="link" class="px-0">
            <NuxtLink to="/login">Войти</NuxtLink>
          </Button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
