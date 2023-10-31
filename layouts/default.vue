<template>
  <main class="px-10 py-20 text-center">
    <div relative z-10>
      <slot />
      <Footer />
      <div class="z-1 mx-auto mt-5 text-center text-sm opacity-25">
        [Default Layout]
      </div>
    </div>

    <ClientOnly>
      <DrawTree fixed left-0 top-0 />
    </ClientOnly>
  </main>
</template>
