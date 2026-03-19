export interface Game {
    id: number
    title: string | null
    description: string | null
    authorId: number
    minAge: number | null
    maxAge: number | null
    minPlayers: number | null
    maxPlayers: number | null
    duration: number | null
    locationType: string | null
    photos: string[] | null
    requisites: string[] | null
    isPublic: boolean | null
    stages: Stage[]
    createdAt: string
    updatedAt: string | null,
    likesCount: number,
    commentsCount: number
}

export interface Stage {
    id: number
    title: string
    description: string
    duration: number
    tasks: string[]
    props: string[]
    stageOrder: number
}
