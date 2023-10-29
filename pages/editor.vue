<script setup lang='ts'>
const editState = useEditState()

const text = ref<string>('')
editState.$subscribe(async (state) => {
  let data
  console.log('now', editState.currentEditFileName)
  const path = `/api/post/${editState.currentEditFileName}`

  data = await useFetch(`/api/post/${editState.currentEditFileName}`).data.value
  console.log(data)
  text.value = data?.contentHtml
})
/* const path = `/api/post/${ids[0]}`
const id = ids[0]

console.log(path)
const data = await useFetch('/api/post/pre-rendering').data?.value
console.log(data?.contentHtml) */

/* async function getContent(id: string) {
  return await useFetch(`/api/post/${id}`).data.value
}
 */
/* interface Res { id: string; contentHtml: string } */
/* async function getContent() {
  if (ids) {
    console.log(ids[0])
    const data = useFetch(`/api/post/${ids[0]}`).data.value
    console.log(data)
  }
}
getContent() */

/* const text = (await getContent(ids![0]).value as Res)!.contentHtml */
</script>

<template>
  <div>
    <h1>editor</h1>
    <div class="main">
      <FileIndex />
      <div class="typing">
        <textarea v-model="text" />
        <div class="preview" v-html="text" />
      </div>
    </div>
  </div>
</template>

<style scoped lang='less'></style>
