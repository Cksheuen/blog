<script setup lang='ts'>
const route = useRoute()
const id = route.params.id

const { data, pending, error, refresh } = await useFetch(`/api/post/${id}`)
</script>

<template>
  <div v-if="pending">
    Loading...
  </div>
  <div v-if="!pending" w-100 justify-center class="text" v-html="data!.contentHtml" />
</template>

<style scoped>
.text{
  margin: 0 auto;
}
</style>
