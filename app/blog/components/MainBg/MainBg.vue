<script lang="ts" setup>
import BasicBg from './Background/BasicBg.vue'
import BetterBg from './Background/BetterBg.vue'

const themeStore = useThemeSwitch()
const { currentTheme } = storeToRefs(themeStore)
</script>

<template>
  <BasicBg v-if="currentTheme === 'basic'" />
  <BetterBg v-else />
</template>
