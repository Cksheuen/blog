<script setup lang="ts">
const { path } = defineProps<{ path: string }>()

const icons = ref<boolean[]>([])

const { data, pending, error, refresh } = await useFetch('/api/posts/postDirs', {
  method: 'POST',
  body: JSON.stringify({
    path,
  }),
})
/*
const years = computed<string[]>(() => {
  const years: string[] = []
  data?.value!.forEach((element, index) => {
    years[index] = element.cdate[0] + element.cdate[1] + element.cdate[2] + element.cdate[3]
    if (years[index] !== years[index - 1])
      icons.value[index] = true
    else icons.value[index] = false
  })
  return years
}) */
/*
const { postDirs } = useServerFunctions()
const data = await postDirs(path)

console.log(data)

const years = computed<string[]>(() => {
  const years: string[] = []
  data!.forEach((element, index) => {
    years[index] = element.cdate.getFullYear().toString()
    if (years[index] !== years[index - 1])
      icons.value[index] = true
    else icons.value[index] = false
  })
  return years
}) */
</script>

<template>
  <div relative z-1>
    <ul class="list">
      <!-- v-if="!pending" -->
      <template v-for="(item, index) in data" :key="index">
        <!-- <div v-if="icons[index]" relaive pointer-events-none z-5 h-20 flex justify-left c-gray>
          <span
            absolute text-8em font-bold color-transparent text-stroke-2 text-stroke-hex-aaa op10
          >{{ years[index] }}</span>
        </div> -->
        <div mb-5 flex justify-left text-xl opacity-50 transition-duration-100 hover-opacity-100>
          <NuxtLink :to="`/posts/${path}/${item!.id.replace(/\.md$/, '')}`">
            {{ item!.id.replace(/\.md$/, '') }}
            <!-- <span text-sm opacity-25> {{ new Date(item.cdate).toLocaleDateString('en', {
              month: 'long',
              day: 'numeric',
            })
            }}</span> -->
            <span class="twt" text-sm opacity-25>{{ item!.id.replace(/\.md$/, '') }}</span>
          </NuxtLink>
        </div>
      </template>
    </ul>
    <!-- <div v-else>
      Loading...
    </div> -->
  </div>
</template>

<style scoped>
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
  @font-face {
font-family: 'TeyvatBlack-Regular';
src: url('/fontStyles/TeyvatBlack-Regular.ttf') format('truetype');
font-weight: normal;
font-style: normal;
}
  .twt{
    font-family: 'TeyvatBlack-Regular';
  }
</style>
