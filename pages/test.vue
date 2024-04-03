<script setup lang="ts">
const iswindows = ref(false)
onMounted(() => {
  iswindows.value = true
})
</script>

<template>
  <ThemeClock />
</template>
