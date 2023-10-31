<script setup lang="ts">
let ids: string[] = []
const { data, pending, error, refresh } = await useFetch('/api/post/postDirs')

ids = data.value?.map((title: string) => {
  return title.replace(/\.md$/, '')
}) as string[]
</script>

<template>
  <div relative z-1>
    <h1>List of Items</h1>
    <ul v-if="!pending">
      <li v-for="(item, index) in ids" :key="index">
        <NuxtLink :to="`/posts/${item}`">
          {{ item }}
        </NuxtLink>
      </li>
    </ul>
    <div v-else>
      Loading...
    </div>
  </div>
</template>
