<script setup lang='ts'>
import AuthorInf from '../components/LuofuStyle/AuthorInf.vue'
import BlogList from '../components/LuofuStyle/BlogList.vue'
import { list_theme } from '~/composables/listChange'

const sentence = "nvim is such an interesting tool"
onMounted(() => {
  console.log(sentence)
  console.log("but it still have some questions to overcome")
})
</script>

<template>
  <div font-600 text-clock-bg-500>
    <div mx-auto flex justify-center gap-10>
      <AuthorInf />
      <BlogList :path="list_theme" />
    </div>
  </div>
</template>

<style scoped>
.colored {
  /* transform: translateY(-60px);
     filter: drop-shadow(var(--clock-bg-500) 0 0px); */
  /* background-image: url('../public/imgs/Luofu.png'),
        linear-gradient(#f00, #f00); */
  /* background-blend-mode: lighten; */
  /* background-size: cover; */
  background-color: var(--clock-bg-500);
  mask-image: url('../public/imgs/Luofu.png');
  mask-size: cover;
}

.user-name {
  position: relative;
}

.user-name::after {
  content: "totally fw";
  position: absolute;
  bottom: -.5rem;
  left: -2rem;
  font-size: 12%;
  display: block;
  color: var(--clock-text-900);
  font-weight: 300;
}
</style>
