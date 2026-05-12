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
    ],
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'http://82.202.139.222:8080/api',
        changeOrigin: true,
        prependPath: true,
      },
      '/photo': {
        target: 'http://82.202.139.222:8080/api',
        changeOrigin: true,
        prependPath: true,
      }
    }
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
    apiBase: 'http://82.202.139.222:8080/api', // SSR идёт напрямую
    public: {
      apiBase: '' // клиент использует devProxy
    }
  }
})
