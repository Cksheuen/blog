<script setup lang="ts">
import { appName } from '~/constants'

useHead({
  title: appName,
})

const glslAnimation = useGlslAnimationStore()
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <MainBg />
    <ThemeClock v-show="glslAnimation.animation_clock || glslAnimation.clock_show_state" />
  </ClientOnly>
</template>

<style>
html, body , #__nuxt{
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  background: #222;
  color: white;
}
</style>
