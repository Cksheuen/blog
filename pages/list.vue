<template>
  <div>
    <Sidebar />
    <ClientOnly fallback-tag="span" fallback="Loading comments...">
      <List />
    </ClientOnly>
  </div>
</template>
