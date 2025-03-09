<script setup lang="ts">
const glslAnimation = useGlslAnimationStore()
const { switchTheme } = useThemeSwitch()

function openClock() {
  glslAnimation.setClockState(!glslAnimation.clock_show_state)
}
</script>

<template>
  <div text="clock-bg-500" flex="~ gap3" fixed right-10 top-0 z-20 m-5>
    <span i-carbon-time right-0 top-0 cursor-pointer @click="openClock" />
    <span i-carbon-mountain cursor-pointer @click="() => switchTheme()" />
    <NuxtLink i-carbon-campsite to="/" />
    <a i-carbon-logo-github href="https://github.com/Cksheuen/blog" target="_blank" />
  </div>
</template>
