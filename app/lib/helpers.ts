export const getPhotoUrl = (path: string):string => {
    if(!path) return ''
    const config = useRuntimeConfig()
    return `/photo${path}`
}

export const getUserFullName = (author?: UserProfile | undefined):string => {
    if (!author) return ''
    const parts = [author.lastName, author.name].filter(Boolean)
    return parts.length ? parts.join(' ') : author.email
}

export const formatDate = (date:string):string => {
    return new Date(date).toLocaleString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
    })
}

export const goToGame = (gameId: number):void => {
    const router = useRouter()
    navigateTo(`/games/${gameId}`)
}
