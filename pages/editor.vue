<script setup lang='ts'>
const editState = useEditState()

interface Text {
  markdown: string
  html: string
}
const text = ref<Text>({ markdown: '', html: '' })
editState.$subscribe(async (state) => {
  const data = await useFetch(`/api/post/${editState.currentEditFileName}`, {
    options: {
      method: 'GET',
      lazy: true,
    },
  }).data.value

  text.value.markdown = data?.fileContent
  text.value.html = data?.contentHtml
})
</script>

<template>
  <div>
    <h1>editor</h1>
    <div class="main">
      <FileIndex />
      <div v-if="text !== { markdown: '', html: '' }" class="typing" h-100 flex overflow-hidden>
        <div class="write" flex-1>
          <textarea v-model="text.markdown" bg-black c-white class="textarea" />
        </div>
        <div class="preview" flex-1>
          <textarea v-model="text.html" bg-black c-white class="textarea" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing{
  overflow-x: hidden;
}
.textarea{
  width: 100%;
height: 100%;
}
.preview{
  height: 100%;
}
</style>
