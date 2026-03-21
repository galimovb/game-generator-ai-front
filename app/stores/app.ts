import { defineStore } from 'pinia'

export const useAppData = defineStore('appData', () => {
    const theme = useCookie<'light' | 'dark'>('theme', { default: () => 'light' })
    const fontSize = useCookie<string>('font', { default: () => '16' })
    const radius = useCookie<string>('radius', { default: () => '0.5' })
    const color = useCookie<string>('color', { default: () => 'blue' })

    const isDarkTheme = computed(() => theme.value === 'dark')

    const availableFontSize = ['13', '14', '15', '16', '17', '18', '19', '20']
    const availableRadius = ['0', '0.25', '0.5', '0.75', '1']

    const availableColors = {
        //default: { label: 'Сланец', preview: '#334155' },
        zinc: { label: 'Цинк', preview: '#3f3f46' },
        gray: { label: 'Пепел', preview: '#374151' },
        green: { label: 'Зелень', preview: '#15803d' },
        rose: { label: 'Роза', preview: '#be123c' },
        orange: { label: 'Заря', preview: '#c2410c' },
        sky: { label: 'Небо', preview: '#0ea5e9' },
        blue: { label: 'Лазурь', preview: '#1d4ed8' },
        purple: { label: 'Лилия', preview: '#6d28d9' }
    }

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
        if (value in availableColors) {
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

    // Применяем настройки при инициализации
    applyTheme()
    applyColor()
    applyRadius()
    applyFont()

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
