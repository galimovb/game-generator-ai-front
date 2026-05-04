export interface Game {
    id: number
    title: string | null
    description: string | null
    author: User
    age: number | null
    players: number | null
    duration: number | null
    locationType:  GameLocationType
    fieldWidth: number | null
    fieldLength: number | null
    activityLevel: GameActivityLevel
    photos: string[] | null
    requisites: string[] | null
    isPublic: boolean | null
    stages: Stage[]
    commentsCount: number
    likesCount: number
    isLiked: boolean
    createdAt: string
    updatedAt: string | null,
}

export interface Stage {
    id: number
    title: string
    description: string
    duration: number
    tasks: string[]
    props: string[]
}
