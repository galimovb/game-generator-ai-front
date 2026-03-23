<script setup lang="ts">
import { Loader } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const { post } = useApi()
const router = useRouter()

// Состояние формы регистрации
const registerData = reactive<UserRegister>({
  email: '',
  login: '',
  password: '',
  name: '',
  lastName: '',
  middleName: ''
})

const loading = ref(false)
const error = ref('')

// Валидация
const isFormValid = computed(() => {
  return registerData.email.includes('@') &&
      registerData.password.length >= 6
})

const handleSubmit = async () => {
  if (!isFormValid.value) {
    error.value = 'Проверьте правильность заполнения полей'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await post('/auth/register', registerData)
    await router.push('/login')
  } catch (err: any) {
    error.value = err.data?.message || 'Ошибка при регистрации'
  } finally {
    loading.value = false
  }
}

// Очистка ошибки при вводе
watch([() => registerData.email, () => registerData.password, () => registerData.login], () => {
  error.value = ''
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-full max-w-md shadow-lg">
      <!-- Шапка -->
      <CardHeader class="text-center">
        <CardTitle class="text-2xl font-bold">Регистрация</CardTitle>
        <CardDescription>
          Создайте новый аккаунт
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-2">
          <!-- Email -->
          <div class="space-y-2">
            <Label for="email" class="font-medium">Email</Label>
            <Input
                id="email"
                v-model="registerData.email"
                type="email"
                placeholder="ivan@example.com"
                required
            />
          </div>

          <!-- Логин -->
          <div class="space-y-2">
            <Label for="login" class="font-medium">Логин</Label>
            <Input
                id="login"
                v-model="registerData.login"
                type="text"
                placeholder="ivan123"
            />
          </div>

          <!-- Пароль -->
          <div class="space-y-2">
            <Label for="password" class="font-medium">Пароль</Label>
            <Input
                id="password"
                v-model="registerData.password"
                type="password"
                placeholder="••••••••"
                required
            />
            <p class="text-xs text-gray-500">
              Минимум 6 символов
            </p>
          </div>

          <!-- Имя (опционально) -->
          <div class="space-y-2">
            <Label for="name" class="font-medium">Имя</Label>
            <Input
                id="name"
                v-model="registerData.name"
                type="text"
                placeholder="Иван"
            />
          </div>

          <!-- Фамилия (опционально) -->
          <div class="space-y-2">
            <Label for="lastName" class="font-medium">Фамилия</Label>
            <Input
                id="lastName"
                v-model="registerData.lastName"
                type="text"
                placeholder="Иванов"
            />
          </div>

          <!-- Отчество (опционально) -->
          <div class="space-y-2">
            <Label for="middleName" class="font-medium">Отчество</Label>
            <Input
                id="middleName"
                v-model="registerData.middleName"
                type="text"
                placeholder="Иванович"
            />
          </div>

          <Button
              type="submit"
              class="w-full"
              :disabled="loading || !isFormValid"
          >
            <Loader v-if="loading" class="animate-spin mr-2" :size="16" />
            {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </Button>
        </form>
      </CardContent>

      <!-- Ссылка на логин -->
      <CardFooter class="justify-center pb-6">
        <p class="text-sm text-muted-foreground">
          Уже есть аккаунт?
          <Button variant="link" class="px-0">
            <NuxtLink
                to="/login"
            >
              Войти
            </NuxtLink>
          </Button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<style scoped>
</style>
