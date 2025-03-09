<script lang="ts" setup>
import * as wasm from 'wasm_scene'

const { day_time, time_fly, flown_time } = storeToRefs(useGlslAnimationStore())
let bg: wasm.Painter

onMounted(() => {
  const sita = ((day_time.value + 12) % 24 / 12 - 2) * 3.1415926
  bg = wasm.Painter.new(sita)
})

let tick = 0
let timer: number

function time_fly_update() {
  tick += 1
  if (tick > 20) {
    bg.update(((flown_time.value + day_time.value + 12) % 24 / 12 - 2) * 3.1415926)
    tick = 0
  }
  timer = requestAnimationFrame(time_fly_update)
}
watch(time_fly, (val) => {
  if (val) { timer = requestAnimationFrame(time_fly_update) }
  else {
    cancelAnimationFrame(timer)
    bg.update(((day_time.value + 12) % 24 / 12 - 2) * 3.1415926)
  }
})
</script>

<template>
  <canvas id="canvas" fixed top-0 z--1 h-full w-full />
</template>

<style scoped>
.src-h {
    height: calc(80vh);
}
</style>
