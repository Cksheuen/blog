<script setup lang="ts">
const iswindows = ref(false)
onMounted(() => {
  iswindows.value = true
})
</script>

<template>
  <MdEditor v-if="iswindows" />
</template>
