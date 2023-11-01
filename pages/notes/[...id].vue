<script setup lang='ts'>
import('github-markdown-css/github-markdown-light.css')
import('github-markdown-css/github-markdown-dark.css')

const colorMode = useColorMode()

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
  <div v-if="!pending" justify-center :class="theme" text-left v-html="data!.contentHtml" />
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
