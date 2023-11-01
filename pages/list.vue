<script setup lang="ts">
const ids: string[] = []
const dates: string[] = []
const icons: boolean[] = []
const { data, pending, error, refresh } = await useFetch('/api/post/postDirs')

data.value!.forEach((element, index) => {
  ids[index] = element.id.replace(/\.md$/, '')
  dates[index] = element.cdate[0] + element.cdate[1] + element.cdate[2] + element.cdate[3]
  if (dates[index] !== dates[index - 1])
    icons[index] = true
  else icons[index] = false
})
</script>

<template>
  <div relative z-1>
    <ul v-if="!pending" class="list">
      <template v-for="(item, index) in ids" :key="index">
        <div v-if="icons[index]" relaive pointer-events-none z-5 h-20 flex justify-left c-gray>
          <span
            absolute text-8em font-bold color-transparent text-stroke-2 text-stroke-hex-aaa op10
          >{{ dates[index] }}</span>
        </div>
        <div mb-5 flex justify-left text-xl opacity-25 transition-duration-100 hover-opacity-100>
          <NuxtLink :to="`/posts/${item}`">
            {{ item }}
          </NuxtLink>
        </div>
      </template>
    </ul>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<style>
.list {
		box-sizing: border-box;
		min-width: 200px;
		max-width: 650px;
		margin: 0 auto;
		padding: 45px;
    background-color: transparent;
	}

	@media (max-width: 767px) {
		.markdown-body-dark {
			padding: 15px;
		}
	}
</style>
