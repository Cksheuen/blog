<script lang="ts" setup>
import BasicBg from './Background/BasicBg.vue'
import BetterBg from './Background/BetterBg.vue'

const themeStore = useThemeSwitch()
const { currentTheme } = storeToRefs(themeStore)

const exist = ref(false)

watch(currentTheme, (newVal) => {
  if (newVal === 'better')
    exist.value = true
})
</script>

<template>
  <BasicBg v-show="currentTheme === 'basic'" />
  <!-- <template v-if="exist"> -->
  <BetterBg
    :if-show="currentTheme === 'better'"
  />
  <!-- </template> -->
</template>
