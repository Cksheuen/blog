<script>
// Local Registration
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

export default {
  name: 'Editor',
  components: {
    MavonEditor: mavonEditor,
    // or 'mavon-editor': mavonEditor
  },
}
</script>

<template>
  <div id="editor">
    <MavonEditor style="height: 100%" />
  </div>
</template>

<style>
#editor {
  margin: auto;
  width: 80%;
  height: 580px;
}
</style>
