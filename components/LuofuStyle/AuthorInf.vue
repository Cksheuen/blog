<script setup lang="ts">
const lists = ['Blogs', 'Notes', 'Demos']
const list_icons = ['i-carbon-blog', 'i-carbon-notebook-reference', 'i-carbon-demo']
const chosen = ref(0)
</script>

<template>
  <div class="left">
    <div class="inf glass" w-70 b-1 b-clock-text-900 rd-2 b-solid py-5>
      <div relative z-2>
        <img src="../../public/yuyuz.jpg" alt="yuyuz" h-20 class="avatar">
        <h1 class="user-name" mx-10 mb-2 b-b-4 border-b-clock-bg-400 b-b-solid pb-2>
          才开始h-u-en/混
        </h1>
        <p mb-1 text-3 font-400>
          这么懒的人怎么可能完成什么目标
        </p>
        <div flex flex-col items-center justify-center b-t-1 b-t-clock-text-900 b-t-solid pt-2>
          <div text-clock-bg-500>
            22
          </div>
          <div flex items-center justify-center text-3 font-400>
            <span i-carbon-document inline-block h-3 w-3 />
            动态
          </div>
        </div>
      </div>
    </div>
    <div class="list">
      <div
        v-for="(list, i) in lists" :key="list"
        :class="`list glass ${i === chosen ? 'list-active' : 'list-unactive'}`"
        relative my-5 w-70 flex cursor-pointer items-center
        justify-left b-1 b-solid px-4 py-1 transition-all duration-300 ease-in-out @click="chosen = i"
      >
        <div v-if="i === chosen" class="bg-font lightSpeedInLeft" absolute bottom-1 right-1 text-5 text-clock-bg-400>
          {{ list }}
        </div>
        <span :class="list_icons[i]" mr-3 inline-block h-8 w-8 />
        <span> {{ list }}</span>
      </div>
    </div>
  </div>
</template>

<style src="./LuofuStyle.css"></style>

<style src="./animate.css"></style>

<style scoped>
.avatar {
  border-radius: 50%;
  border: 2px solid var(--clock-bg-500);
  margin: 0 auto;
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

.bg-font {
  font-family: 'TeyvatBlack-Regular';
}

.list-unactive {
  border-color: var(--clock-bg-900);
  color: var(--clock-bg-900);
  filter: drop-shadow(0 0 5px var(--clock-bg-900));
}

.list-active {
  border-color: var(--clock-bg-900);
  color: var(--clock-bg-500);
  filter: drop-shadow(0 0 5px var(--clock-bg-500));
}
</style>
