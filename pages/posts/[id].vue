<script setup lang='ts'>
const route = useRoute()
const id = route.params.id

const data = await useFetch(`/api/post/${id}`, {
  method: 'GET',
  body: JSON.stringify({
    id,
  }),
}).data?.value
console.log(data?.contentHtml)
</script>

<template>
  <div v-html="data!.contentHtml" />
</template>

<style scoped lang='less'></style>
