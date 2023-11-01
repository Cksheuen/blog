<script setup lang='ts'>
import('github-markdown-css/github-markdown-light.css')
import('github-markdown-css/github-markdown-dark.css')
const el = $ref<HTMLDivElement>()

/* const theme = useThemeSwitch() */

const colorMode = useColorMode()
/* loadTheme()
theme.$subscribe(() => {
  loadTheme()
})
let style: any

async function loadTheme() {
  style = undefined
  if (colorMode.preference === 'light') {
    console.log('light')

    style = await import('github-markdown-css/github-markdown-light.css')
  }

  else if (colorMode.preference === 'dark') {
    console.log('dark')
    style = await import('github-markdown-css/github-markdown-dark.css')
  }

  // 其他操作
} */

const cssPath = `github-markdown-css/github-markdown${useThemeSwitch().currentTheme}.css`

const route = useRoute()
const id = route.params.id

const { data, pending, error, refresh } = await useFetch(`/api/post/${id}`)

const theme = computed(() => {
  if (colorMode.preference === 'light')
    return 'markdown-body-light'

  else if (colorMode.preference === 'dark')
    return 'markdown-body-dark'
  return 'markdown-body-light'
})
</script>

<template>
  <div v-if="pending">
    Loading...
  </div>
  <div v-if="!pending" ref="el" justify-center :class="theme" text-left v-html="data!.contentHtml" />
</template>

<style scoped>
.markdown-body-dark {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
    background-color: transparent;
	}

	@media (max-width: 767px) {
		.markdown-body-dark {
			padding: 15px;
		}
	}
  .markdown-body-light {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 980px;
		margin: 0 auto;
		padding: 45px;
    background-color: transparent;
	}

	@media (max-width: 767px) {
		.markdown-body-light {
			padding: 15px;
		}
	}
</style>
