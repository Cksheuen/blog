<!-- <script setup lang='ts'>
import Reveal from '../../../components/Reveal/Reveal.vue'
import Artical from '../../../components/Artical.vue'

const route = useRoute()
const id = route.params.id[0]

const chooseComponent = ref<boolean>(false)

function switchCom() {
  chooseComponent.value = !chooseComponent.value
}
</script>

<template>
  <div>
    <div absolute left-10 top-10 z-100 btn @click="switchCom">
      switch
    </div>
    <Artical :id="id" path="notes" mr-10 />
    <div h-10 w-100>
      <Reveal />
    </div>
  </div>
</template> -->

<script setup lang='ts'>
const route = useRoute()
const id = route.params.id[0]
</script>

<template>
  <div>
    <!-- <ClientOnly fallback-tag="span" fallback="Loading comments..."> -->
    <Artical :id="id" path="notes" />
    <!-- </ClientOnly> -->
  </div>
</template>
