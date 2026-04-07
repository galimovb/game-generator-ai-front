// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  components: [
    { path: '~/components', pathPrefix: false }
  ],
  imports: {
    dirs: [
      'types/*.ts',
      'lib/*.ts',
    ],
  },

  vite: {
    plugins: [
        tailwindcss(),
    ]
  },

  modules: ['shadcn-nuxt', '@pinia/nuxt', 'vue-sonner/nuxt'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  vueSonner: {
    css: true
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  },
  runtimeConfig: {
    //на этот уровень класть те, что доступны только на сервере
    public: {
      apiBase: ''
    }
  }
})
