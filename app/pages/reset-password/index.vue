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

const route = useRoute();
const { post } = useApi();
const { $toast } = useNuxtApp();

const token = computed(() => route.query.token as string | undefined);

const schema = toTypedSchema(
  z
    .object({
      password: z.string().min(8, "Минимум 8 символов"),
      passwordConfirm: z.string().min(1, "Обязательное поле"),
    })
    .refine((d) => d.password === d.passwordConfirm, {
      message: "Пароли не совпадают",
      path: ["passwordConfirm"],
    }),
);

const { handleSubmit } = useForm({
  validationSchema: schema,
  initialValues: { password: "", passwordConfirm: "" },
});

const loading = ref(false);
const done = ref(false);

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    $toast.error("Неверная ссылка для сброса пароля");
    return;
  }
  loading.value = true;
  try {
    await post("/auth/reset-password", {
      token: token.value,
      password: values.password,
    });
    done.value = true;
  } catch {
    $toast.error("Ссылка недействительна или устарела");
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-center">Новый пароль</CardTitle>
        <CardDescription v-if="!token" class="text-center text-destructive">
          Ссылка недействительна
        </CardDescription>
      </CardHeader>

      <CardContent v-if="!done && token" class="pb-2">
        <form class="space-y-2" @submit.prevent="onSubmit">
          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Новый пароль</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="••••••••"
                  :disabled="loading"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="passwordConfirm">
            <FormItem>
              <FormLabel>Повторите пароль</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="••••••••"
                  :disabled="loading"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full mt-4" :disabled="loading">
            <Loader v-if="loading" class="animate-spin mr-2" :size="16" />
            Сохранить пароль
          </Button>
        </form>
      </CardContent>

      <CardContent v-else-if="done" class="pb-2 text-center">
        <p class="text-sm text-muted-foreground">Пароль успешно изменён</p>
      </CardContent>

      <CardFooter class="flex justify-center">
        <Button variant="link" class="px-0">
          <NuxtLink to="/login">Вернуться ко входу</NuxtLink>
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
