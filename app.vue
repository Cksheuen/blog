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
    <!-- <DrawTree fixed left-0 top-0 /> -->

    <MainBg />
    <ThemeClock v-show="glslAnimation.animation_clock" />
    <!-- <component :is="glslComponent" /> -->
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
