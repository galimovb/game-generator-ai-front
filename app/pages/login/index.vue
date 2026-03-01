<script setup lang="ts">
import {reactive, ref} from 'vue'
import {UserLogin} from "../../types/user";
import { Loader } from 'lucide-vue-next'
const { post } = useApi()

const loginData = reactive<UserLogin>({
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    await post('/auth/login', {
      email: loginData.email,
      password: loginData.password
    })

    await navigateTo('/')

  } catch (err) {
    error.value = err.data?.message || 'Ошибка при входе'
  } finally {
    await navigateTo('/profile')
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
              <Label for="email">Email</Label>
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
                <Label for="password">Password</Label>
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

          <!-- Сообщение об ошибке -->
          <p v-if="error" class="text-sm text-red-500 mt-4">
            {{ error }}
          </p>

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
      <div class="px-6 pb-2 text-center">или</div>
      <CardFooter class="flex flex-col gap-2">
        <Button variant="outline" class="w-full">
          Войти через
          <img src="~/assets/img/yandex-icon.png" class="w-5 h-5">
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
