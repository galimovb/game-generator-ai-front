export const useGamesList = (options: {
    endpoint: string
    key: string
    query?: Ref<Record<string, any>>
}) => {
    const { get } = useApi()

    const page = ref(1)
    const limit = ref(20)

    const { data, pending, refresh } = useAsyncData(
        options.key,
        async () => {
            return await get(options.endpoint, {
                query: {
                    page: page.value,
                    limit: limit.value,
                    ...(options.query?.value || {})
                }
            })
        },
        {
            watch: [page, options.query || ref({})],
            server: true,
            default: () => ({
                result: {
                    items: [],
                    pagination: { total: 0 }
                }
            })
        }
    )

    const games = ref<Game[]>([])
    const total = ref(0)
    const loading = computed(() => pending.value)

    watch(data, (newData) => {
        if (newData?.result) {
            games.value = newData.result.items
            total.value = newData.result.pagination.total
        }
    }, { immediate: true })

    const updateGameCommentsCount = (gameId: number, change: number) => {
        const index = games.value.findIndex(g => g.id === gameId)
        if (index !== -1) {
            games.value[index] = {
                ...games.value[index],
                commentsCount: Math.max(0, games.value[index].commentsCount + change)
            }
        }
    }

    const incrementComments = (gameId: number) => updateGameCommentsCount(gameId, 1)
    const decrementComments = (gameId: number) => updateGameCommentsCount(gameId, -1)

    const toggleLike = (gameId: number) => {
        const index = games.value.findIndex(g => g.id === gameId)
        if (index !== -1) {
            const game = games.value[index]
            const newIsLiked = !game.isLiked
            games.value[index] = {
                ...game,
                isLiked: newIsLiked,
                likesCount: game.likesCount + (newIsLiked ? 1 : -1)
            }
        }
    }

    return {
        page,
        limit,
        games,
        total,
        loading,
        refresh,
        incrementComments,
        decrementComments,
        toggleLike
    }
}
