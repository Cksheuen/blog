<script setup lang="ts">
const glslAnimation = useGlslAnimationStore()

function openClock() {
  glslAnimation.setClockState(!glslAnimation.clock_show_state)
}
</script>

<template>
  <div text="clock-bg-500" flex="~ gap3" fixed right-10 top-0 z-20 m-5>
    <span right-0 top-0 cursor-pointer @click="openClock">
      Theme Clock
    </span>
    <NuxtLink to="/blogList">
      Blog
    </NuxtLink>
    <NuxtLink to="/noteList">
      Note
    </NuxtLink>
    <NuxtLink to="/demoList">
      Demos
    </NuxtLink>
    <NuxtLink i-carbon-campsite to="/" />
    <a i-carbon-logo-github href="https://github.com/Cksheuen/blog" target="_blank" />
    <DarkToggle />
  </div>
</template>
