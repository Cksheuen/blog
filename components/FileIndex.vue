<script setup lang='ts'>
const editState = useEditState()
let isLoaded = false
const rootPath = '/api/post/postDirs'

const { data, pending, error, refresh } = await useFetch(rootPath)

const titles = data.value

console.log('titles', titles)

const ids = computed(() => {
  return titles?.map((title) => {
    return title.replace(/\.md$/, '')
  }) as string[]
})

isLoaded = true

function clickHandler(index: number) {
  editState.setNewCur(ids[index])
}
</script>

<template>
  <div class="list" inline-block>
    <ul v-if="isLoaded">
      <li v-for="(item, index) in ids" :key="index" flex cursor-pointer @click="clickHandler(index)">
        <div i-carbon-document text-1xl inline-block />
        <div text-1xl inline-block>
          {{ item }}
        </div>
      </li>
    </ul>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style scoped>
.listItem{
  cursor:pointer
}
</style>
