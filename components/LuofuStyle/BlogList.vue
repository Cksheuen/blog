<script setup lang='ts'>

</script>

<template>
  <div class="right">
    <div
      v-for="i in 10" :key="i" :class="`glass ${i === 0 ? 'mb-3' : 'my-3'}`" mx-5
      w-170 flex flex-row rd-2 p-5 text-left
    >
      <div class="inf" w-115>
        <div class="date" text-3 font-400 text-clock-text-500>
          2024/9/6
        </div>
        <div class="title" text-5 font-400 text-clock-bg-800>
          NX锐评学校
        </div>
        <div class="content-validity" mb-3 mt-1 text-4 font-400>
          #tag#content
        </div>
        <div class="comments at-you" relative flex items-center justify-start text-3>
          <span i-carbon-document-comment mx-1 inline-block h-4 w-4 />
          <span>11</span>
        </div>
      </div>
      <div class="img" h-30 w-45 bg-red />
    </div>
  </div>
</template>

<style src="./LuofuStyle.css"></style>

<style scoped>
.right {
  overflow-y: scroll;
  height: 65vh;
  scrollbar-width: thin;
  scroll-behavior: smooth;
  scrollbar-gutter: stable both-edges;
  scrollbar-color: var(--clock-bg-900) transparent;
}
.at-you::after {
  content: "[有人@你]";
  margin: 0;
  margin-left: .25rem;
  color: var(--clock-bg-300);
  font-weight: 300;
  text-shadow: 0 0 5px var(--clock-bg-500), 0 0 10px var(--clock-bg-500), 0 0 15px var(--clock-bg-500);
  vertical-align: top;
}

.right {
  --show-top-mask: 1;
  --show-bottom-mask: 1;
  --mask-size: 25px;
  --gradient: linear-gradient(to bottom, transparent 0%,
  white calc(var(--show-top-mask) * var(--mask-size)),
  white calc(100% - calc(var(--mask-size)*var(--show-bottom-mask))),
   transparent 100%);
  -webkit-mask: var(--gradient);
  mask: var(--gradient);
}
</style>
