<script setup lang="ts">
const titles = useFetch('/api/post/postDirs').data.value

const ids = titles?.map((title) => {
  return title.replace(/\.md$/, '')
})
</script>

<template>
  <div relative z-1>
    <h1>List of Items</h1>
    <ul>
      <li v-for="(item, index) in ids" :key="index">
        <NuxtLink :to="`/posts/${item}`">
          {{ item }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style>
/* Your CSS styles here */
</style>
