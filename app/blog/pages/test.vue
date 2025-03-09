<script lang="ts" setup>
import * as wasm from 'wasm_scene'

/* onMounted(() => {
  import('../../../wasm/wasm-scene/pkg/wasm_scene').then((wasm) => {
    wasm.start()
  })
}) */
onMounted(() => {
  const bg = wasm.Painter.new(1.)
  setTimeout(() => {
    bg.update(2.)
  }, 1000)

})
</script>

<template>
  <div class="src-h w-full">
    <canvas id="canvas" />
  </div>
</template>

<style scoped>
.src-h {
  height: calc(80vh);
}
</style>
