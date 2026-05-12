import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['app/components/ui/**', '.nuxt', 'node_modules'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  }
})
