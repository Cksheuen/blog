<template>
  <div>
    <ClientOnly fallback-tag="span" fallback="Loading comments...">
      <Editor />
    </ClientOnly>
  </div>
</template>
