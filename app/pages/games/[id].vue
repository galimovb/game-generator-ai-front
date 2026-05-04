<script setup lang="ts">
import { Plus, Check, X, Loader, Pencil, Trash2, Image as ImageIcon } from 'lucide-vue-next'
import { toast } from "vue-sonner"

const route = useRoute()
const { get, patch, del } = useApi()
const { $toast } = useNuxtApp()

const profileStore = useProfileStore()
const { profile } = storeToRefs(profileStore)

// Состояния
const game = ref<Game | null>(null)
const loading = ref(true)
const saving = ref(false)
const isLoadingError = ref(false)
const isAuthor = ref(false)
const isEditing = ref(false)
const isDeleting = ref(false)

// Состояния загрузки для стадий
const savingStageId = ref<number | null>(null)
const deletingStageId = ref<number | null>(null)

// Редактирование стадий
const editingStageId = ref<number | null>(null)
const editingStageData = ref<Required<Omit<Stage, 'id'>>| null>(null)

// Новые поля для добавления
const newStageTask = ref('')
const newStageProp = ref('')
const addingTaskForStage = ref<number | null>(null)
const addingPropForStage = ref<number | null>(null)

// Форма редактирования игры
const form = ref({
  title: '',
  description: '',
  age: 0,
  players: 0,
  duration: 0,
  locationType: '',
  fieldWidth: 0,
  fieldLength: 0,
  activityLevel: '',
  requisites: [] as string[],
  isPublic: false
})

const newRequisite = ref('')
const isAddingRequisit = ref(false)

const loadData = async () => {
  loading.value = true
  isLoadingError.value = false

  try {
    const gameId = route.params.id
    const gameResponse = await get(`/games/${gameId}`)
    game.value = gameResponse.result

    isAuthor.value = profile.value?.id === game.value?.author.id

    if (game.value) {
      form.value = {
        title: game.value.title || '',
        description: game.value.description || '',
        age: game.value.age || 0,
        players: game.value.players || 0,
        duration: game.value.duration || 0,
        locationType: game.value.locationType || '',
        fieldWidth: game.value.fieldWidth || 0,
        fieldLength: game.value.fieldLength || 0,
        activityLevel: game.value.activityLevel || '',
        requisites: game.value.requisites || [],
        isPublic: game.value.isPublic || false
      }
    }
  } catch (err: any) {
    $toast.error('Произошла ошибка при загрузке игры', {
      action: {
        label: 'Повторить',
        onClick: () => loadData(),
      },
    })
    isLoadingError.value = true
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
      age: game.value.age || 0,
      players: game.value.players || 0,
      duration: game.value.duration || 0,
      locationType: game.value.locationType || '',
      fieldWidth: game.value.fieldWidth || 0,
      fieldLength: game.value.fieldLength || 0,
      activityLevel: game.value.activityLevel || '',
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
    $toast.error('Ошибка сохранения изменений')
  } finally {
    saving.value = false
  }
}

const startEditingStage = (stage: Stage) => {
  editingStageId.value = stage.id
  editingStageData.value = {
    title: stage.title,
    description: stage.description,
    duration: stage.duration,
    tasks: [...stage.tasks],
    props: [...stage.props]
  }
}

// Отмена редактирования стадии
const cancelEditingStage = () => {
  editingStageId.value = null
  editingStageData.value = null
  addingTaskForStage.value = null
  addingPropForStage.value = null
  newStageTask.value = ''
  newStageProp.value = ''
}

// Сохранение изменений стадии
const saveStageChanges = async (stageId: number) => {
  if (!game.value || !editingStageData.value) return

  savingStageId.value = stageId
  try {
    const response = await patch(`/games/${game.value.id}/stages/${stageId}`, editingStageData.value)
    const stageIndex = game.value.stages.findIndex(s => s.id === stageId)
    if (stageIndex !== -1) {
      game.value.stages[stageIndex] = response.result
    }
    cancelEditingStage()
    toast.success('Стадия обновлена')
  } catch (err: any) {
    $toast.error('Ошибка сохранения стадии')
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
    $toast.error('Ошибка удаления стадии')
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
    $toast.error('Ошибка удаления игры')
  } finally {
    isDeleting.value = false
  }
}

// Добавление задачи к стадии
const addStageTask = () => {
  if (newStageTask.value.trim() && editingStageData.value) {
    editingStageData.value.tasks.push(newStageTask.value.trim())
    newStageTask.value = ''
    addingTaskForStage.value = null
  }
}

// Удаление задачи из стадии
const removeStageTask = (taskIndex: number) => {
  if (editingStageData.value) {
    editingStageData.value.tasks.splice(taskIndex, 1)
  }
}

// Добавление реквизита к стадии
const addStageProp = () => {
  if (newStageProp.value.trim() && editingStageData.value) {
    editingStageData.value.props.push(newStageProp.value.trim())
    newStageProp.value = ''
    addingPropForStage.value = null
  }
}

// Удаление реквизита из стадии
const removeStageProp = (propIndex: number) => {
  if (editingStageData.value) {
    editingStageData.value.props.splice(propIndex, 1)
  }
}

// Загрузка при монтировании
onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div class="container mx-auto py-4 md:px-2 md:py-6 lg:py-8 lg:px-4">
    <div v-if="isLoadingError" class="text-center py-12">
      <p class="text-destructive">Произошла ошибка при загрузке игры</p>
      <Button class="mt-4" @click="loadData">Повторить</Button>
    </div>

    <Card v-else>
      <CardHeader>
        <div class="flex justify-between items-start gap-4">
          <CardTitle class="md:text-xl break-words flex-1">
            <Skeleton v-if="loading" class="h-8" />
            <Input v-else-if="isEditing" v-model="form.title" placeholder="Название игры" :disabled="saving" />
            <template v-else>{{ game?.title || 'Без названия' }}</template>
          </CardTitle>

          <div v-if="!loading && isAuthor && !isEditing" class="flex gap-2">
            <Button @click="startEditing" variant="link" size="sm">Изменить</Button>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="ghost" size="sm" class="hover:text-destructive">
                  <Trash2 :size="16" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>Восстановить игру будет невозможно</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction class="bg-destructive" @click="deleteGame">
                    <Loader v-if="isDeleting" class="animate-spin" />
                    <span v-else>Удалить</span>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <User v-if="!isAuthor && !loading" :user="game?.author" :size="9" name-field="email" />
          <Skeleton v-if="loading" class="h-10" />
        </div>
      </CardHeader>

      <CardContent class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Фото -->
          <div>
            <Skeleton v-if="loading" class="w-full h-64 rounded-lg" />
            <div v-else-if="game?.photos?.length" class="relative">
              <Carousel>
                <CarouselContent>
                  <CarouselItem v-for="(photo, idx) in game.photos" :key="idx">
                    <img :src="getPhotoUrl(photo)" class="w-full h-64 object-cover rounded-lg" />
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious v-if="game.photos.length > 1" class="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7" />
                <CarouselNext v-if="game.photos.length > 1" class="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7" />
              </Carousel>
            </div>
            <div v-else class="flex justify-center items-center w-full h-64 bg-muted rounded-lg border">
              <ImageIcon :size="48" class="text-muted-foreground" />
              <p v-if="isEditing" class="text-sm ml-2">Фото нельзя изменить</p>
            </div>
          </div>

          <!-- Параметры -->
          <div class="md:col-span-2">
            <div class="grid grid-cols-2 gap-4">
              <template v-if="loading">
                <Skeleton v-for="i in 8" :key="i" class="h-8" />
              </template>

              <template v-else>
                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Возраст</Label>
                  <Input v-if="isEditing" v-model.number="form.age" type="number" :disabled="saving" />
                  <p v-else class="text-sm font-medium">{{ game?.age }} лет</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Игроки</Label>
                  <Input v-if="isEditing" v-model.number="form.players" type="number" :disabled="saving" />
                  <p v-else class="text-sm font-medium">{{ game?.players }} чел</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Длительность</Label>
                  <Input v-if="isEditing" v-model.number="form.duration" type="number" :disabled="saving" />
                  <p v-else class="text-sm font-medium">{{ game?.duration }} мин</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Локация</Label>
                  <Select v-if="isEditing" v-model="form.locationType" :disabled="saving">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="(value, key) in gameLocationTypes" :key="key" :value="key">
                        {{ value }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-else class="text-sm font-medium">{{ gameLocationTypes[game?.locationType] }}</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Ширина площадки</Label>
                  <Input v-if="isEditing" v-model.number="form.fieldWidth" type="number" :disabled="saving" />
                  <p v-else class="text-sm font-medium">{{ game?.fieldWidth }} м</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Длина площадки</Label>
                  <Input v-if="isEditing" v-model.number="form.fieldLength" type="number" :disabled="saving" />
                  <p v-else class="text-sm font-medium">{{ game?.fieldLength }} м</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Активность</Label>
                  <Select v-if="isEditing" v-model="form.activityLevel" :disabled="saving">
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="(value, key) in activityLevels" :key="key" :value="key">
                        {{ value }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-else class="text-sm font-medium">{{ activityLevels[game?.activityLevel] }}</p>
                </div>

                <div class="space-y-1">
                  <Label class="text-xs text-muted-foreground">Статус</Label>
                  <div v-if="isEditing" class="flex items-center gap-2 pt-1">
                    <Checkbox v-model="form.isPublic" :disabled="saving" />
                    <Label class="text-xs">Публичная игра</Label>
                  </div>
                  <Badge v-else :variant="game?.isPublic ? 'default' : 'secondary'" class="block w-fit">
                    {{ game?.isPublic ? 'Публичная' : 'Черновик' }}
                  </Badge>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Описание -->
        <div class="space-y-1">
          <Skeleton v-if="loading" class="h-20" />
          <template v-else>
            <Label class="text-xs text-muted-foreground">Описание</Label>
            <Textarea v-if="isEditing" v-model="form.description" rows="3" :disabled="saving" placeholder="Описание игры" />
            <p v-else class="text-sm">{{ game?.description || 'Нет описания' }}</p>
          </template>
        </div>

        <!-- Реквизит -->
        <div class="space-y-1">
          <Skeleton v-if="loading" class="h-10" />
          <template v-else>
            <div class="flex items-center gap-2">
              <Label class="text-xs text-muted-foreground">Реквизит</Label>
              <Button v-if="isEditing" variant="outline" size="icon" class="h-7 w-7" @click="isAddingRequisit = !isAddingRequisit" :disabled="saving">
                <Plus :size="14" />
              </Button>
            </div>

            <div v-if="!isEditing && game?.requisites?.length" class="flex flex-wrap gap-2">
              <Badge v-for="item in game.requisites" :key="item" variant="outline">{{ item }}</Badge>
            </div>

            <div v-if="isEditing" class="flex flex-wrap gap-2">
              <Badge v-for="(item, idx) in form.requisites" :key="idx" variant="outline">
                {{ item }}
                <X :size="12" class="ml-1 cursor-pointer" @click="removeRequisite(idx)" />
              </Badge>
              <div v-if="isAddingRequisit" class="flex gap-2">
                <Input v-model="newRequisite" class="w-40" placeholder="Название" @keyup.enter="addRequisite" />
                <Button size="icon" class="h-7 w-7" @click="addRequisite"><Check :size="14" /></Button>
              </div>
              <span v-if="!form.requisites.length && !isAddingRequisit" class="text-sm text-muted-foreground">Нет реквизита</span>
            </div>

            <p v-if="!isEditing && !game?.requisites?.length" class="text-sm text-muted-foreground">Нет реквизита</p>
          </template>
        </div>

        <!-- Стадии -->
        <div v-if="!isEditing && !loading && game?.stages?.length" class="space-y-3">
          <Label class="text-xs text-muted-foreground">Стадии игры ({{ game.stages.length }})</Label>
          <div class="grid grid-cols-1 gap-3">
            <Card v-for="stage in game.stages" :key="stage.id" class="p-3 md:p-5">
              <CardHeader class="p-0">
                <div class="flex items-start justify-between gap-4">
                  <!-- Название: либо текст, либо инпут -->
                  <CardTitle v-if="editingStageId !== stage.id" class="break-words pr-2">
                    {{ stage.title }}
                  </CardTitle>
                  <Input v-else v-model="editingStageData.title" placeholder="Название стадии" class="flex-1" :disabled="savingStageId === stage.id" />

                  <div class="flex items-center gap-1">
                    <span class="text-sm text-muted-foreground">{{ stage.duration }} мин</span>

                    <!-- Кнопки для просмотра -->
                    <template v-if="editingStageId !== stage.id">
                      <Button v-if="isAuthor" variant="ghost" size="icon" class="h-7 w-7" @click="startEditingStage(stage)">
                        <Pencil :size="14" />
                      </Button>
                      <Button v-if="isAuthor" variant="ghost" size="icon" class="h-7 w-7 hover:text-destructive" @click="deleteStage(stage.id)">
                        <Trash2 :size="14" />
                      </Button>
                    </template>

                    <!-- Кнопки для редактирования -->
                    <template v-else>
                      <Button variant="ghost" size="icon" class="h-7 w-7 text-primary" @click="saveStageChanges(stage.id)" :disabled="savingStageId === stage.id">
                        <Loader v-if="savingStageId === stage.id" class="w-4 h-4 animate-spin" />
                        <Check v-else :size="14" />
                      </Button>
                      <Button variant="ghost" size="icon" class="h-7 w-7" @click="cancelEditingStage" :disabled="savingStageId === stage.id">
                        <X :size="14" />
                      </Button>
                    </template>
                  </div>
                </div>

                <!-- Описание: либо текст, либо textarea -->
                <CardDescription v-if="editingStageId !== stage.id" class="break-words mt-2">
                  {{ stage.description }}
                </CardDescription>
                <Textarea v-else v-model="editingStageData.description" placeholder="Описание стадии" rows="2" class="mt-2" :disabled="savingStageId === stage.id" />

                <!-- Длительность: только в режиме редактирования -->
                <div v-if="editingStageId === stage.id" class="flex items-center gap-2 mt-2">
                  <Label class="text-sm">Длительность (мин)</Label>
                  <Input v-model.number="editingStageData.duration" type="number" min="1" class="w-24" :disabled="savingStageId === stage.id" />
                </div>
              </CardHeader>

              <CardContent class="p-0 pt-3 space-y-2">
                <!-- Задания -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-medium text-muted-foreground">Задания:</p>
                    <Button v-if="editingStageId === stage.id && isAuthor" variant="outline" size="icon" class="h-6 w-6" @click="addingTaskForStage = stage.id" :disabled="savingStageId === stage.id">
                      <Plus :size="12" />
                    </Button>
                  </div>

                  <!-- Список заданий (режим просмотра) -->
                  <ul v-if="editingStageId !== stage.id && stage.tasks?.length" class="list-disc list-inside text-sm">
                    <li v-for="task in stage.tasks" :key="task" class="break-words">{{ task }}</li>
                  </ul>

                  <!-- Список заданий (режим редактирования) -->
                  <div v-if="editingStageId === stage.id" class="space-y-1">
                    <div v-for="(task, idx) in editingStageData.tasks" :key="idx" class="flex items-center gap-2 group">
                      <span class="text-sm flex-1 break-words">• {{ task }}</span>
                      <Button variant="ghost" size="icon" class="h-5 w-5" @click="removeStageTask(idx)" :disabled="savingStageId === stage.id">
                        <X :size="12" />
                      </Button>
                    </div>
                    <!-- Инпут добавления задания-->
                    <div v-if="addingTaskForStage === stage.id" class="flex items-center gap-2 mt-1">
                      <Input v-model="newStageTask" placeholder="Новое задание" class="flex-1" @keyup.enter="addStageTask" :disabled="savingStageId === stage.id" />
                      <Button size="icon" class="h-7 w-7" @click="addStageTask" :disabled="savingStageId === stage.id">
                        <Check :size="14" />
                      </Button>
                    </div>
                  </div>
                </div>

                <!-- Реквизит этапа -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <p class="text-xs font-medium text-muted-foreground">Реквизит этапа:</p>
                    <Button v-if="editingStageId === stage.id && isAuthor" variant="outline" size="icon" class="h-6 w-6" @click="addingPropForStage = stage.id" :disabled="savingStageId === stage.id">
                      <Plus :size="12" />
                    </Button>
                  </div>

                  <!-- Список реквизита (режим просмотра) -->
                  <div v-if="editingStageId !== stage.id && stage.props?.length" class="flex flex-wrap gap-1">
                    <Badge v-for="prop in stage.props" :key="prop" variant="outline" class="text-xs">{{ prop }}</Badge>
                  </div>

                  <!-- Список реквизита (режим редактирования) -->
                  <div v-if="editingStageId === stage.id" class="space-y-1">
                    <div class="flex flex-wrap gap-1">
                      <div v-for="(prop, idx) in editingStageData.props" :key="idx" class="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm group">
                        <span class="break-all">{{ prop }}</span>
                        <Button variant="ghost" class="p-0.5 h-5 w-5 hover:text-destructive" @click="removeStageProp(idx)" :disabled="savingStageId === stage.id">
                          <X :size="12" />
                        </Button>
                      </div>
                      <!-- Инпут добавления реквизита-->
                      <div v-if="addingPropForStage === stage.id" class="flex items-center gap-2 mt-1">
                        <Input v-model="newStageProp" placeholder="Новый реквизит" class="w-40" @keyup.enter="addStageProp" :disabled="savingStageId === stage.id" />
                        <Button size="icon" class="h-7 w-7" @click="addStageProp" :disabled="savingStageId === stage.id">
                          <Check :size="14" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- Кнопки сохранения/отмены редактирования игры -->
        <div v-if="isEditing" class="flex justify-end gap-2 pt-4">
          <Button variant="outline" @click="cancelEdit">Отмена</Button>
          <Button @click="saveChanges" :disabled="saving">
            <Loader v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
            Сохранить
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
