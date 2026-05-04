<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const { $toast } = useNuxtApp()

const { post } = useApi()

const loginData = reactive<UserLogin>({
  email: '',
  password: ''
})
const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true

  try {
    await post('/auth/login', {
      email: loginData.email,
      password: loginData.password
    })

    await navigateTo('/games/my')
  } catch (err) {
    $toast.error('Ошибка при входе')
    console.log('err', err.error)
    console.log('err', err.errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-center">Войти</CardTitle>
      </CardHeader>
      <CardContent class="pb-2">
        <form @submit.prevent="handleSubmit">
          <div class="grid w-full items-center gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="email">Почта</Label>
              <Input
                  id="email"
                  v-model="loginData.email"
                  type="email"
                  placeholder="m@example.com"
                  required
              />
            </div>
            <div class="flex flex-col space-y-1.5">
              <div class="flex items-center">
                <Label for="password">Пароль</Label>
                <a
                    href="#"
                    class="ml-auto inline-block text-sm underline"
                >
                  Забыли пароль?
                </a>
              </div>
              <Input
                  id="password"
                  v-model="loginData.password"
                  type="password"
                  required
              />
            </div>
          </div>

          <Button
              type="submit"
              class="w-full mt-4"
              :disabled="loading"
          >
            <Loader v-if="loading" class="animate-spin mr-2"/>
            Войти
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col gap-2">
<!--        <div class="px-6 pb-2 text-center">или</div>
        <Button variant="outline" class="w-full">
          Войти через
          <img src="~/assets/img/yandex-icon.png" class="w-5 h-5">
        </Button>-->
        <p class="text-sm text-muted-foreground">
          Нет аккаунта?
          <Button variant="link" class="px-0">
            <NuxtLink
                to="/register"
            >
              Регистрация
            </NuxtLink>
          </Button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
