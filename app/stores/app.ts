import { defineStore } from 'pinia'

export const useAppData = defineStore('appData', () => {
    const theme = useCookie<'light' | 'dark'>('theme', { default: () => 'light' })
    const fontSize = useCookie<string>('font', { default: () => '16' })
    const radius = useCookie<string>('radius', { default: () => '0.5' })
    const color = useCookie<string>('color', { default: () => 'blue' })

    const isDarkTheme = computed(() => theme.value === 'dark')

    const availableColors = [
        { value: 'gray', description: 'Серый' },
        { value: 'zinc', description: 'Цинк' },
        { value: 'rose', description: 'Розовый' },
        { value: 'blue', description: 'Синий' },
        { value: 'green', description: 'Зеленый' },
        { value: 'orange', description: 'Оранжевый' },
        { value: 'purple', description: 'Фиолетовый' },
        { value: 'sky', description: 'Небесный' }
    ]

    const availableFontSize = ['13', '14', '15', '16', '17', '18', '19', '20']
    const availableRadius = ['0', '0.25', '0.5', '0.75', '1']

    function setTheme(newTheme: 'light' | 'dark') {
        theme.value = newTheme
    }

    function setFont(value: string) {
        if (availableFontSize.includes(value)) {
            fontSize.value = value
        }
    }

    function setRadius(value: string) {
        if (availableRadius.includes(value)) {
            radius.value = value
        }
    }

    function setColor(value: string) {
        const colorExists = availableColors.some(c => c.value === value)
        if (colorExists) {
            color.value = value
        }
    }

    function applyTheme() {
        if (isDarkTheme.value) {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
        } else {
            document.documentElement.classList.add('light')
            document.documentElement.classList.remove('dark')
        }
    }

    function applyColor() {
        document.documentElement.setAttribute('data-theme', color.value || 'blue')
    }

    function applyRadius() {
        document.documentElement.setAttribute('data-radius', radius.value || '0.5')
    }

    function applyFont() {
        document.documentElement.setAttribute('data-font', fontSize.value || '16')
    }

    watch(theme, applyTheme)
    watch(color, applyColor)
    watch(radius, applyRadius)
    watch(fontSize, applyFont)

    return {
        theme,
        fontSize,
        radius,
        color,
        isDarkTheme,
        availableFontSize,
        availableRadius,
        availableColors,
        setTheme,
        setFont,
        setRadius,
        setColor
    }
})
