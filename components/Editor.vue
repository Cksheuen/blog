<script setup lang='ts'>
const editState = useEditState()

interface Text {
  markdown: string
  html: string
}
const text = ref<Text>({ markdown: '', html: '' })
editState.$subscribe(async (state) => {
  const { data, pending, error, refresh } = await useFetch(`/api/post/${editState.currentEditFileName}`, {
    options: {
      method: 'GET',
      lazy: true,
    },
  })

  text.value.markdown = data?.fileContent
  text.value.html = data?.contentHtml
})

function changeHtml(value: any) {
  if (value === '<p><br></p>')
    return
  ruleForm.value.content = value
}
</script>

<template>
  <div relative z-1>
    <div class="main" w-200 style="margin: 0 auto;" flex>
      <FileIndex w-100 />
      <RichEditor @changeHtml="changeHtml" />
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
