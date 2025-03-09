import { ref } from 'vue'

const list_theme = ref('blogs')

function changeListTheme(theme: string) {
  list_theme.value = theme
}

export {
  list_theme,
  changeListTheme,
}
