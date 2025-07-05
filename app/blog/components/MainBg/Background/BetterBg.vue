<script lang="ts" setup>
import type { Painter } from 'wasm_scene'

const props = defineProps<{ ifShow: boolean }>()

const { day_time, time_fly, flown_time } = storeToRefs(useGlslAnimationStore())

let wasm: any
let bg: Painter

function init() {
  const sita = ((day_time.value + 12) % 24 / 12 - 2) * 3.1415926
  bg = wasm.Painter.new(sita)
}

requestIdleCallback(() => {
  import('wasm_scene').then((module) => {
    wasm = module
  })
})

watch(props, (val) => {
  if (val.ifShow && !bg)
    init()
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

onUnmounted(() => {
  bg.free()
})
</script>

<template>
  <canvas v-show="props.ifShow" id="canvas" fixed top-0 z--1 h-full w-full />
</template>

<style scoped>
.src-h {
    height: calc(80vh);
}
</style>
