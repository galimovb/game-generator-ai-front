<script setup lang="ts">
import { Plus, Check, X, Loader, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from "vue-sonner"

const route = useRoute()
const { get, patch, del } = useApi()

const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

// Состояния
const game = ref<Game | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const isAuthor = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)

// Состояния загрузки для стадий
const savingStageId = ref<number | null>(null)
const deletingStageId = ref<number | null>(null)

// Редактирование стадий
const editingStageId = ref<number | null>(null)
const stageForms = ref<Record<number, {
  title: string
  description: string
  duration: number
  tasks: string[]
  props: string[]
}>>({})

// Новые поля для добавления
const newStageTask = ref('')
const newStageProp = ref('')
const addingTaskForStage = ref<number | null>(null)
const addingPropForStage = ref<number | null>(null)

// Форма редактирования игры
const form = ref({
  title: '',
  description: '',
  minAge: 0,
  maxAge: 0,
  minPlayers: 0,
  maxPlayers: 0,
  duration: 0,
  locationType: '',
  requisites: [] as string[],
  isPublic: false
})

// Новый реквизит
const newRequisite = ref('')
const isAddingRequisit = ref(false)

// Загрузка данных
const loadData = async () => {
  loading.value = true
  error.value = ''

  try {
    const gameId = route.params.id

    const gameResponse = await get(`/games/${gameId}`)
    game.value = gameResponse.result

    isAuthor.value = profile.value?.id === game.value?.author.id

    if (game.value) {
      form.value = {
        title: game.value.title || '',
        description: game.value.description || '',
        minAge: game.value.minAge || 0,
        maxAge: game.value.maxAge || 0,
        minPlayers: game.value.minPlayers || 0,
        maxPlayers: game.value.maxPlayers || 0,
        duration: game.value.duration || 0,
        locationType: game.value.locationType || '',
        requisites: game.value.requisites || [],
        isPublic: game.value.isPublic || false
      }

      // Инициализация форм стадий
      game.value.stages?.forEach(stage => {
        stageForms.value[stage.id] = {
          title: stage.title || '',
          description: stage.description || '',
          duration: stage.duration || 0,
          tasks: stage.tasks || [],
          props: stage.props || []
        }
      })
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Ошибка загрузки игры'
  } finally {
    loading.value = false
  }
}

// Начать редактирование игры
const startEditing = () => {
  if (game.value) {
    form.value = {
      title: game.value.title || '',
      description: game.value.description || '',
      minAge: game.value.minAge || 0,
      maxAge: game.value.maxAge || 0,
      minPlayers: game.value.minPlayers || 0,
      maxPlayers: game.value.maxPlayers || 0,
      duration: game.value.duration || 0,
      locationType: game.value.locationType || '',
      requisites: game.value.requisites || [],
      isPublic: game.value.isPublic || false
    }
    isEditing.value = true
  }
}

// Отмена редактирования игры
const cancelEdit = () => {
  isEditing.value = false
}

// Добавление реквизита игры
const addRequisite = () => {
  if (newRequisite.value.trim()) {
    form.value.requisites.push(newRequisite.value.trim())
    newRequisite.value = ''
    isAddingRequisit.value = false
  }
}

// Удаление реквизита игры
const removeRequisite = (index: number) => {
  form.value.requisites.splice(index, 1)
}

// Сохранение игры
const saveChanges = async () => {
  if (!game.value) return

  saving.value = true
  try {
    const response = await patch(`/games/${game.value.id}`, form.value)
    game.value = response.result
    isEditing.value = false
    toast.success('Изменения сохранены')
  } catch (err: any) {
    toast.error('Ошибка сохранения изменений')
    console.error('Ошибка сохранения изменений', err.message)
  } finally {
    saving.value = false
  }
}

// ===== ФУНКЦИИ ДЛЯ СТАДИЙ =====

// Начать редактирование стадии
const startEditingStage = (stageId: number) => {
  editingStageId.value = stageId
}

// Отмена редактирования стадии
const cancelEditingStage = (stageId: number) => {
  editingStageId.value = null
  // Восстанавливаем исходные данные
  const stage = game.value?.stages?.find(s => s.id === stageId)
  if (stage) {
    stageForms.value[stageId] = {
      title: stage.title || '',
      description: stage.description || '',
      duration: stage.duration || 0,
      tasks: stage.tasks || [],
      props: stage.props || []
    }
  }
}

// Сохранение изменений стадии
const saveStageChanges = async (stageId: number) => {
  if (!game.value) return

  savingStageId.value = stageId
  try {
    const response = await patch(`/games/${game.value.id}/stages/${stageId}`, stageForms.value[stageId])
    // Обновляем данные в game
    const stageIndex = game.value.stages.findIndex(s => s.id === stageId)
    if (stageIndex !== -1) {
      game.value.stages[stageIndex] = response.result
    }
    editingStageId.value = null
    toast.success('Стадия обновлена')
  } catch (err: any) {
    toast.error('Ошибка сохранения стадии')
    console.error('Ошибка сохранения стадии', err.message)
  } finally {
    savingStageId.value = null
  }
}

// Удаление стадии
const deleteStage = async (stageId: number) => {
  deletingStageId.value = stageId
  try {
    await del(`/games/${game.value.id}/stages/${stageId}`)
    if (game.value) {
      game.value.stages = game.value.stages.filter(s => s.id !== stageId)
    }
    toast.success('Стадия удалена')
  } catch (err: any) {
    toast.error('Ошибка удаления стадии')
    console.error('Ошибка удаления стадии', err.message)
  } finally {
    deletingStageId.value = null
  }
}

const deleteGame = async () => {
  try {
    isDeleting.value = true
    await del(`/games/${game.value.id}`)
    if (document.referrer) {
      window.location.href = document.referrer;
    } else {
      window.location.href = '/games';
    }
  } catch (err: any) {
    toast.error('Ошибка удаления игры')
    console.error('Ошибка удаления игры', err.message)
  } finally {
    isDeleting.value = false
  }
}

// Добавление задачи к стадии
const addStageTask = (stageId: number) => {
  if (newStageTask.value.trim()) {
    if (!stageForms.value[stageId].tasks) {
      stageForms.value[stageId].tasks = []
    }
    stageForms.value[stageId].tasks.push(newStageTask.value.trim())
    newStageTask.value = ''
    addingTaskForStage.value = null
  }
}

// Удаление задачи из стадии
const removeStageTask = (stageId: number, taskIndex: number) => {
  stageForms.value[stageId].tasks.splice(taskIndex, 1)
}

// Добавление реквизита к стадии
const addStageProp = (stageId: number) => {
  if (newStageProp.value.trim()) {
    if (!stageForms.value[stageId].props) {
      stageForms.value[stageId].props = []
    }
    stageForms.value[stageId].props.push(newStageProp.value.trim())
    newStageProp.value = ''
    addingPropForStage.value = null
  }
}

// Удаление реквизита из стадии
const removeStageProp = (stageId: number, propIndex: number) => {
  stageForms.value[stageId].props.splice(propIndex, 1)
}

// Загрузка при монтировании
onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Скелетон загрузки -->
    <div v-if="loading">
      <Card>
        <CardHeader>
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div class="space-y-2 w-full sm:w-auto flex-1">
              <Skeleton class="h-8 w-full sm:w-3/4" />
              <Skeleton class="h-4 w-full sm:w-1/2" />
            </div>
            <Skeleton class="h-10 w-full sm:w-24" />
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Скелетон фото -->
          <div class="space-y-2">
            <Skeleton class="h-4 w-24" />
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <Skeleton v-for="i in 4" :key="i" class="aspect-square w-full rounded" />
            </div>
          </div>

          <!-- Скелетон описания -->
          <div class="space-y-2">
            <Skeleton class="h-4 w-20" />
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-5/6" />
            <Skeleton class="h-4 w-4/6" />
          </div>

          <!-- Скелетон параметров -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="i in 4" :key="i" class="space-y-1">
              <Skeleton class="h-3 w-12" />
              <Skeleton class="h-5 w-16" />
            </div>
          </div>

          <!-- Скелетон реквизита -->
          <div class="space-y-2">
            <Skeleton class="h-4 w-20" />
            <div class="flex flex-wrap gap-2">
              <Skeleton v-for="i in 4" :key="i" class="h-6 w-16 rounded" />
            </div>
          </div>

          <!-- Скелетон статуса -->
          <Skeleton class="h-6 w-24" />

          <!-- Скелетон стадий -->
          <div class="space-y-3">
            <Skeleton class="h-4 w-32" />
            <div class="grid grid-cols-1 gap-3">
              <Card v-for="i in 2" :key="i">
                <CardHeader class="pb-2">
                  <div class="flex flex-col sm:flex-row justify-between gap-2">
                    <Skeleton class="h-5 w-full sm:w-32" />
                    <Skeleton class="h-4 w-12" />
                  </div>
                  <Skeleton class="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent class="pt-0 space-y-2">
                  <Skeleton class="h-3 w-20" />
                  <Skeleton class="h-4 w-full" />
                  <Skeleton class="h-4 w-5/6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
      <Button class="mt-4" @click="loadData">Повторить</Button>
    </div>

    <!-- Контент -->
    <div v-else-if="game">
      <Card>
        <CardHeader>
          <div class="flex flex-row justify-between items-start gap-4">
            <div>
              <CardTitle class="text-2xl break-words">
                {{ game.title || 'Без названия' }}
              </CardTitle>
            </div>

            <div v-if="isAuthor && !isEditing" class="flex gap-2 items-center">
              <!-- Кнопка редактирования игры -->
              <Button
                  @click="startEditing"
                  variant="link"
                  size="sm"
                  :disabled="saving || !!savingStageId || !!deletingStageId"
              >
                Изменить
              </Button>
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <Button
                      variant="ghost"
                      size="sm"
                      class="hover:text-destructive"
                      :disabled="saving || !!savingStageId || !!deletingStageId"
                  >
                    <Trash2 :size="16"/>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Восстановить игру будет невозможно
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        class="bg-destructive hover:bg-destructive/80"
                        @click="deleteGame"
                    >
                      <span v-if="!isDeleting">Удалить</span>
                      <Loader v-else class="animate-spin"/>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div v-else class="flex items-center gap-2" title="Автор">
              <User name-position="left" :user="game.author" :size="9" name-field="email"/>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- Фото -->
          <div v-if="game.photos?.length" class="space-y-2">
            <Label>Фотографии</Label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              <img
                  v-for="(photo, idx) in game.photos"
                  :key="idx"
                  :src="getPhotoUrl(photo)"
                  class="aspect-square w-full rounded object-cover border"
                  alt="Game photo"
              />
            </div>
          </div>

          <!-- РЕЖИМ ПРОСМОТРА ИГРЫ -->
          <div v-if="!isEditing" class="space-y-4">
            <!-- Описание -->
            <div v-if="game.description" class="space-y-1">
              <Label>Описание</Label>
              <p class="text-sm break-words">{{ game.description }}</p>
            </div>

            <!-- Параметры -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="space-y-1">
                <Label class="text-xs">Возраст</Label>
                <p class="text-sm font-medium">{{ game.minAge }}-{{ game.maxAge }} лет</p>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Игроки</Label>
                <p class="text-sm font-medium">{{ game.minPlayers }}-{{ game.maxPlayers }}</p>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Длительность</Label>
                <p class="text-sm font-medium">{{ game.duration }} мин</p>
              </div>
              <div class="space-y-1">
                <Label class="text-xs">Локация</Label>
                <p class="text-sm font-medium">{{ gameLocationTypes[game?.locationType] }}</p>
              </div>
            </div>

            <!-- Реквизит -->
            <div v-if="game.requisites?.length" class="space-y-1">
              <Label>Реквизит</Label>
              <div class="flex flex-wrap gap-2">
                <Badge
                    v-for="(item, idx) in game.requisites"
                    :key="idx"
                    variant="outline"
                    class="break-all"
                >
                  {{ item }}
                </Badge>
              </div>
            </div>

            <!-- Статус публичности -->
            <div class="flex items-center gap-2">
              <Badge :variant="game.isPublic ? 'default' : 'secondary'">
                {{ game.isPublic ? 'Публичная' : 'Черновик' }}
              </Badge>
            </div>

            <!-- Стадии -->
            <div v-if="game.stages?.length" class="space-y-3">
              <Label>Стадии игры ({{ game.stages.length }})</Label>
              <div class="grid grid-cols-1 gap-3">
                <Card
                    v-for="stage in game.stages"
                    :key="stage.id"
                >
                  <!-- Режим просмотра стадии -->
                  <div v-if="editingStageId !== stage.id">
                    <CardHeader class="pb-2">
                      <div class="flex items-start justify-between">
                        <CardTitle class="text-base break-words pr-2">
                          {{ stage.title }}
                        </CardTitle>
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <span class="text-sm text-muted-foreground whitespace-nowrap mr-2">
                            {{ stage.duration }} мин
                          </span>
                          <!-- Кнопки управления стадией (только в режиме редактирования игры) -->
                          <Button
                              variant="ghost"
                              size="xs"
                              class="h-8 w-8"
                              title="Редактировать стадию"
                              @click="startEditingStage(stage.id)"
                              :disabled="!!savingStageId || !!deletingStageId"
                          >
                            <Pencil :size="16" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="xs"
                              class="h-8 w-8 hover:text-destructive"
                              title="Удалить стадию"
                              @click="deleteStage(stage.id)"
                              :disabled="deletingStageId === stage.id || !!savingStageId"
                          >
                            <Loader v-if="deletingStageId === stage.id" class="w-4 h-4 animate-spin" />
                            <Trash2 v-else :size="16" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription class="break-words">{{ stage.description }}</CardDescription>
                    </CardHeader>
                    <CardContent class="pt-0 space-y-2">
                      <div v-if="stage.tasks?.length">
                        <p class="text-xs font-medium text-muted-foreground mb-1">Задания:</p>
                        <ul class="list-disc list-inside text-sm space-y-0.5">
                          <li v-for="(task, idx) in stage.tasks" :key="idx" class="break-words">
                            {{ task }}
                          </li>
                        </ul>
                      </div>
                      <div v-if="stage.props?.length">
                        <p class="text-xs font-medium text-muted-foreground mb-1">Реквизит этапа:</p>
                        <div class="flex flex-wrap gap-1">
                          <Badge
                              v-for="(prop, idx) in stage.props"
                              :key="idx"
                              variant="outline"
                              class="text-xs break-all"
                          >
                            {{ prop }}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  <!-- Режим редактирования стадии -->
                  <div v-else>
                    <CardHeader class="pb-2">
                      <div class="flex items-start justify-between gap-2">
                        <Input
                            v-model="stageForms[stage.id].title"
                            placeholder="Название стадии"
                            class="flex-1"
                            :disabled="savingStageId === stage.id"
                        />
                        <div class="flex items-center gap-1 flex-shrink-0">
                          <Button
                              variant="ghost"
                              size="xs"
                              class="h-8 w-8 text-primary"
                              title="Сохранить"
                              @click="saveStageChanges(stage.id)"
                              :disabled="savingStageId === stage.id"
                          >
                            <Loader v-if="savingStageId === stage.id" class="w-4 h-4 animate-spin" />
                            <Check v-else :size="16" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="xs"
                              class="h-8 w-8"
                              title="Выйти из режима редактирования"
                              @click="cancelEditingStage(stage.id)"
                              :disabled="savingStageId === stage.id"
                          >
                            <X :size="16" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                          v-model="stageForms[stage.id].description"
                          placeholder="Описание стадии"
                          rows="2"
                          class="mt-2"
                          :disabled="savingStageId === stage.id"
                      />
                      <div class="flex items-center gap-2 mt-2">
                        <Label class="text-sm">Длительность (мин)</Label>
                        <Input
                            v-model.number="stageForms[stage.id].duration"
                            type="number"
                            min="1"
                            class="w-24"
                            :disabled="savingStageId === stage.id"
                        />
                      </div>
                    </CardHeader>
                    <CardContent class="pt-0 space-y-3">
                      <!-- Задания -->
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <Label class="text-sm">Задания</Label>
                          <Button
                              variant="outline"
                              size="xs"
                              @click="addingTaskForStage = stage.id"
                              v-if="addingTaskForStage !== stage.id && savingStageId !== stage.id"
                              :disabled="savingStageId === stage.id"
                          >
                            <Plus :size="14" />
                          </Button>
                        </div>

                        <div class="space-y-1">
                          <div
                              v-for="(task, idx) in stageForms[stage.id].tasks"
                              :key="idx"
                              class="flex items-center gap-2 group"
                          >
                            <span class="text-sm flex-1 break-words">• {{ task }}</span>
                            <Button
                                variant="ghost"
                                size="xs"
                                class="h-6 w-6 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                @click="removeStageTask(stage.id, idx)"
                                :disabled="savingStageId === stage.id"
                                v-if="savingStageId !== stage.id"
                            >
                              <X :size="12" />
                            </Button>
                          </div>

                          <div v-if="addingTaskForStage === stage.id" class="flex items-center gap-2 mt-1">
                            <Input
                                v-model="newStageTask"
                                placeholder="Новое задание"
                                class="flex-1"
                                @keyup.enter="addStageTask(stage.id)"
                                :disabled="savingStageId === stage.id"
                            />
                            <Button size="xs" @click="addStageTask(stage.id)" :disabled="savingStageId === stage.id">
                              <Check :size="14" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <!-- Реквизит стадии -->
                      <div class="space-y-2">
                        <div class="flex items-center gap-2">
                          <Label class="text-sm">Реквизит этапа</Label>
                          <Button
                              variant="outline"
                              size="xs"
                              @click="addingPropForStage = stage.id"
                              v-if="addingPropForStage !== stage.id && savingStageId !== stage.id"
                              :disabled="savingStageId === stage.id"
                          >
                            <Plus :size="14" />
                          </Button>
                        </div>

                        <div class="flex flex-wrap gap-1">
                          <div
                              v-for="(prop, idx) in stageForms[stage.id].props"
                              :key="idx"
                              class="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm group"
                          >
                            <span class="break-all">{{ prop }}</span>
                            <Button
                                variant="ghost"
                                class="p-0.5 h-5 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                @click="removeStageProp(stage.id, idx)"
                                :disabled="savingStageId === stage.id"
                                v-if="savingStageId !== stage.id"
                            >
                              <X :size="12" />
                            </Button>
                          </div>

                          <div v-if="addingPropForStage === stage.id" class="flex items-center gap-2">
                            <Input
                                v-model="newStageProp"
                                placeholder="Новый реквизит"
                                class="w-40"
                                @keyup.enter="addStageProp(stage.id)"
                                :disabled="savingStageId === stage.id"
                            />
                            <Button size="xs" @click="addStageProp(stage.id)" :disabled="savingStageId === stage.id">
                              <Check :size="14" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <!-- РЕЖИМ РЕДАКТИРОВАНИЯ ИГРЫ -->
          <div v-else class="space-y-4">
            <!-- Название -->
            <div class="space-y-2">
              <Label>Название</Label>
              <Input v-model="form.title" placeholder="Название игры" :disabled="saving" />
            </div>

            <!-- Описание -->
            <div class="space-y-2">
              <Label>Описание</Label>
              <Textarea v-model="form.description" placeholder="Описание игры" rows="3" :disabled="saving" />
            </div>

            <!-- Возраст -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Мин. возраст</Label>
                <Input v-model.number="form.minAge" type="number" min="3" max="80" :disabled="saving" />
              </div>
              <div class="space-y-2">
                <Label>Макс. возраст</Label>
                <Input v-model.number="form.maxAge" type="number" min="3" max="80" :disabled="saving" />
              </div>
            </div>

            <!-- Игроки -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>Мин. игроков</Label>
                <Input v-model.number="form.minPlayers" type="number" min="1" :disabled="saving" />
              </div>
              <div class="space-y-2">
                <Label>Макс. игроков</Label>
                <Input v-model.number="form.maxPlayers" type="number" min="1" :disabled="saving" />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Длительность -->
              <div class="space-y-2">
                <Label>Длительность (минут)</Label>
                <Input v-model.number="form.duration" type="number" min="5" :disabled="saving" />
              </div>

              <!-- Тип локации -->
              <div class="space-y-2">
                <Label>Тип локации</Label>
                <Select v-model="form.locationType" :disabled="saving">
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                        v-for="(value, key) in gameLocationTypes"
                        :value="key"
                    >
                      {{value}}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Реквизит -->
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Label>Реквизит</Label>
                <Button variant="outline" size="xs" @click="isAddingRequisit = !isAddingRequisit" :disabled="saving">
                  <Plus :size="16"/>
                </Button>
              </div>

              <div class="flex flex-wrap gap-2 mt-2 items-center">
                <Badge
                    v-for="(item, index) in form.requisites"
                    :key="index"
                    variant="outline"
                >
                  {{ item }}
                  <Button
                      variant="ghost"
                      class="p-0.5 h-5 hover:text-destructive flex-shrink-0 ml-auto"
                      @click="removeRequisite(index)"
                      :disabled="saving"
                  >
                    <X :size="12"/>
                  </Button>
                </Badge>

                <template v-if="isAddingRequisit">
                  <div class="flex items-center gap-2 flex-wrap">
                    <Input
                        v-model="newRequisite"
                        placeholder="Название"
                        class="w-40"
                        @keyup.enter="addRequisite"
                        :disabled="saving"
                    />
                    <Button size="xs" title="Сохранить" @click="addRequisite" :disabled="saving">
                      <Check :size="16"/>
                    </Button>
                  </div>
                </template>

                <span v-if="!form.requisites.length && !isAddingRequisit" class="text-sm text-muted-foreground">
                  Нет реквизита
                </span>
              </div>
            </div>

            <!-- Публичность -->
            <div class="flex items-center gap-2">
              <Checkbox v-model="form.isPublic" id="isPublic" :disabled="saving" />
              <Label for="isPublic">Публичная игра</Label>
            </div>

            <!-- Кнопки действий -->
            <div class="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button variant="outline" @click="cancelEdit" class="w-full sm:w-auto" :disabled="saving">Отмена</Button>
              <Button @click="saveChanges" :disabled="saving" class="w-full sm:w-auto">
                <Loader v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
