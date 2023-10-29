import { acceptHMRUpdate, defineStore } from 'pinia'

export const useEditState = defineStore('currentEdit', () => {
  /**
   * Current named of the user.
   */
  const currentEditFileName = ref('')

  function setNewCur(currentFileName: string) {
    currentEditFileName.value = currentFileName
  }

  return {
    setNewCur,
    currentEditFileName,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
