import type {UserProfile} from "../types/user";

export const getPhotoUrl = (path: string):string => {
    const config = useRuntimeConfig()
    return `${config.public.apiBase}${path}`
}

export const getUserFullName = (author: UserProfile) => {
    if (!author) return ''
    const parts = [author.lastName, author.name].filter(Boolean)
    return parts.length ? parts.join(' ') : author.email
}

export const formatDate = (date:string):Date => {
    return new Date(date).toLocaleString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
    })
}

export const goToGame = (gameId: number) => {
    const router = useRouter()
    router.push(`/games/${gameId}`)
}
