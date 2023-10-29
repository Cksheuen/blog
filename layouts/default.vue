<template>
  <main class="px-10 py-20 text-center">
    <!-- <DrawTree fixed left-0 top-0 /> -->
    <slot fixed z-1 />
    <Footer />
    <div class="z-1 mx-auto mt-5 text-center text-sm opacity-25">
      [Default Layout]
    </div>
  </main>
</template>
