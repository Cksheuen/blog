import { acceptHMRUpdate, defineStore } from 'pinia'

export const useThemeSwitch = defineStore('themeSwitch', () => {
  const currentTheme = ref('')

  function setNewCur(newTheme: string) {
    currentTheme.value = newTheme
  }

  return {
    setNewCur,
    currentTheme,
  }
})
