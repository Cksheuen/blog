<script setup lang='ts'>
const route = useRoute()
const id = route.params.id[0]
</script>

<template>
  <div>
    <Sidebar />
    <ClientOnly fallback-tag="span" fallback="Loading comments...">
      <Artical :id="id" />
    </ClientOnly>
  </div>
</template>
