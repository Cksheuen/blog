<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

import TurndownService from 'turndown'

const turndownService = new TurndownService()

// 引入 css

const editorRef = shallowRef() // 编辑器实例，必须用 shallowRef
const valueHtml = ref('<p>hello</p>') // 内容 HTML

// 模拟 ajax 异步获取内容
const editState = useEditState()
editState.$subscribe(async () => {
  const data = await useFetch(`/api/post/${editState.currentEditFileName}`, {
    options: {
      method: 'GET',
      lazy: true,
    },
  }).data.value

  // valueHtml.value = data?.fileContent
  valueHtml.value = data?.contentHtml
})

const toolbarConfig = {}
const editorConfig = { MENU_CONF: {} }
/**
 * @上传图片
 */
editorConfig.MENU_CONF.uploadImage = {
  // 上传图片的配置
  server: '这里是上传图片的地址',
  fieldName: 'image', // 这个是参数名字
  headers: { // 配置token 接口需要就配 不需要就不用
    Authorization: 'Bearer asdfhaohfvdsnvshf',
  },
  customInsert(res, insertFn) {
    // 这个是获取接口返回的数据
    insertFn(res.data.url) // 从 res 中找到 url（也就是接口返回的图片地址），然后插入图片
  },
}

/**
 * @上传视频
 */
editorConfig.MENU_CONF.uploadVideo = {
  server: '这里是上传图片的地址', // 上传图片的请求地址
  fieldName: 'image', // 这个是参数名字
  headers: { // 配置token 接口需要就配 不需要就不用
    Authorization: 'Bearer asdfhaohfvdsnvshf',
  },
  customInsert(res, insertFn) {
    // 这个是获取接口返回的数据
    insertFn(res.data.url) // 从 res 中找到（也就是接口返回的图片地址），然后插入图片
  },
}
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null)
    return
  editor.destroy()
})
function handleCreated(editor) {
  editorRef.value = editor // 记录 editor 实例，重要！
}

async function update() {
  const editor = editorRef.value
  const markdown = turndownService.turndown(editor.getHtml())
  await useFetch('/api/post/setNew', {
    method: 'POST',
    body: JSON.stringify({
      id: editState.currentEditFileName,
      content: markdown,
    }),
  })
}
</script>

<template>
  <div class="all">
    <div class="editor">
      <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :default-config="toolbarConfig" mode="default" />
      <Editor v-model="valueHtml" style="height: 25rem;" overflow-x-hidden :default-config="editorConfig" mode="default" @onCreated="handleCreated" />
    </div>
    <div class="update" mt-5 btn @click="update">
      确认 && 保存
    </div>
  </div>
</template>

<style scoped>
.editor{
  border: 1px solid #ccc;
  background-color: black;
  opacity: 0.5;
}
</style>
