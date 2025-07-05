<script lang="ts" setup>
// import wasm from 'vite-plugin-wasm'
import BasicBg from './Background/BasicBg.vue'
import BetterBg from './Background/BetterBg.vue'

const themeStore = useThemeSwitch()
const { currentTheme } = storeToRefs(themeStore)

const exist = ref(false)

watch(currentTheme, (newVal) => {
  if (newVal === 'better')
    exist.value = true
})

/* onMounted(() => {
  requestIdleCallback(() => {
    import('@scene_init').then((module) => {
      const generator = new module.Generator(window.innerWidth, window.innerHeight)
      module.Vec2
      console.log('window.innerWidth', window.innerWidth)
      console.log('window.innerHeight', window.innerHeight)

      console.log(generator)
    })
  })
}) */

// onMounted(() => {
//   requestIdleCallback(() => {
//     import('@scene_test').then((module) => {
//       console.log(module)

//       const generator = new module.Scene()

//       generator.render()
//     })
//   })
// })

// onMounted(async () => {
/* console.log(navigator.hardwareConcurrency)

  const { Pool } = await import('../../composables/pool/pool')
  const pool = new Pool(navigator.hardwareConcurrency || 4)
  console.log('max', navigator.hardwareConcurrency || 4)

  for (let i = 0; i < 10; i++)
    pool.run(i) */
/* import('@scene_init').then((module) => {
    const { Vec2, cal_pos_relative, init_data } = module

    const start = performance.now()
    const data = init_data(new Vec2(100.0, 0.1))
    for (let i = 0; i < 1000000; i++) {
      const uv = new Vec2(i / 10, i % 10)
      const pos = cal_pos_relative(data.cam_mat, uv, data.ro)
    }
    console.log('串行计算耗时', performance.now() - start)
  }) */
// })
</script>

<template>
  <BasicBg v-show="currentTheme === 'basic'" />
  <!-- <template v-if="exist"> -->
  <BetterBg
    :if-show="currentTheme === 'better'"
  />
  <!-- </template> -->
</template>
