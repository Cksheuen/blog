import { defineStore } from 'pinia'

type Theme = 'basic' | 'better'

export const useThemeSwitch = defineStore('themeSwitch', () => {
  const currentTheme = ref<Theme>('basic')

  function switchTheme() {
    currentTheme.value = currentTheme.value === 'basic' ? 'better' : 'basic'
    console.log('switching theme', currentTheme.value)
  }

  return {
    currentTheme,
    switchTheme,
  }
})
