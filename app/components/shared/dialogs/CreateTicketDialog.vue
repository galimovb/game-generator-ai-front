<script setup lang="ts">
import { Loader2, Send, AlertCircle, Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  success: [ticket: any]
}>()

const open = ref<boolean>(false)
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const formData = ref({
  subject: '',
  description: ''
})

const isFormValid = computed<boolean>(() => {
  return formData.value.subject.trim().length > 0 &&
      formData.value.description.trim().length > 0
})

const resetForm = ():void => {
  formData.value = {
    subject: '',
    description: ''
  }
  error.value = null
}

const createTicket = async ():Promise<void> => {
  if (!isFormValid.value) return

  loading.value = true
  error.value = null

  try {
    const api = useApi()

    // 1. Создаем тикет
    const ticketResponse = await api.post('/tickets', {
      subject: formData.value.subject,
      description: formData.value.description
    })

    const ticket = ticketResponse.data

    // 2. Создаем сообщение в тикете с описанием проблемы
    await api.post(`/tickets/${ticket.id}/messages`, {
      text: formData.value.description
    })

    emit('success', ticket)
    open.value = false
    resetForm()

  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка при создании тикета'
  } finally {
    loading.value = false
  }
}
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
            Опишите вашу проблему. Сотрудник поддержки свяжется с вами в ближайшее время.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <Alert v-if="error" variant="destructive">
            <AlertCircle :size="16" />
            <AlertTitle>Ошибка</AlertTitle>
            <AlertDescription>{{ error }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <Label for="subject">Тема обращения</Label>
            <Input
                id="subject"
                v-model="formData.subject"
                placeholder="Кратко опишите суть проблемы"
                :disabled="loading"
                maxlength="255"
            />
            <p class="text-xs text-muted-foreground">
              {{ formData.subject.length }}/255 символов
            </p>
          </div>

          <div class="space-y-2">
            <Label for="description">Описание проблемы</Label>
            <Textarea
                id="description"
                v-model="formData.description"
                placeholder="Подробно опишите ситуацию..."
                :disabled="loading"
                rows="5"
                maxlength="5000"
            />
            <p class="text-xs text-muted-foreground">
              {{ formData.description.length }}/5000 символов
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="open = false" :disabled="loading">
            Отмена
          </Button>
          <Button @click="createTicket" :disabled="!isFormValid || loading">
            <Loader2 v-if="loading" :size="16" class="mr-2 animate-spin" />
            <Send v-else :size="16" class="mr-2" />
            Отправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
