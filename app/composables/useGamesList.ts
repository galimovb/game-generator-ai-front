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

    const games = computed(() => data.value?.result?.items || [])
    const total = computed(() => data.value?.result?.pagination?.total || 0)
    const loading = computed(() => pending.value)

    return {
        page,
        limit,
        games,
        total,
        loading,
        refresh
    }
}
