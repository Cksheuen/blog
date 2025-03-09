<script setup lang='ts'>
const { id, path } = defineProps<{ id: string, path: string }>()

const colorMode = useColorMode()

const { data, pending, error, refresh } = await useFetch(`/api/posts/getContent`, {
  method: 'POST',
  body: JSON.stringify({
    id,
    path,
  }),
})

onMounted(() => {
  document.querySelectorAll('.markdown-body h1').forEach((h1) => {
    h1.setAttribute('data-text', h1.textContent!)
  })
})
</script>

<template>
  <div class="markdown-body" text-left v-html="data!.contentHtml" />
</template>

<style src="../styles/glass.css"></style>

<style scoped>
.markdown-body {
	box-sizing: border-box;
	min-width: 200px;
	max-width: 980px;
	margin: 0 auto;
	padding: 45px;
	background-color: transparent;

	--color-fg-default: var(--clock-bg-100);
	--color-canvas-default: red  ;
	/* var(--clock-bg-900) */
}

@font-face {
  font-family: 'TeyvatBlack-Regular';
  src: url('/fontStyles/TeyvatBlack-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.twt {
  font-family: 'TeyvatBlack-Regular';
}
</style>
