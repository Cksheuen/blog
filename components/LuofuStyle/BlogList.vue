<script setup lang='ts'>
const { path } = defineProps<{ path: string }>()

interface Article_inf {
  cdate: string
  id: string
  title: string
}

interface Data {
  notes: Article_inf[] | null
  blogs: Article_inf[] | null
  demos: Article_inf[] | null
  [key: string]: Article_inf[] | null
}

const all_data = ref<Data>({
  notes: null,
  blogs: null,
  demos: null,
})

const current_data = ref<Article_inf[]>(null)

async function get_new_data(path: string) {
  current_data.value = await $fetch('/api/posts/postDirs', {
    method: 'POST',
    body: JSON.stringify({
      path,
    }),
  }).then((res) => {
    return res
  }) as Article_inf[]
  all_data.value[path] = current_data.value as Article_inf[]
}

get_new_data(path)

watch(() => path, async () => {
  if (!all_data.value[path])
    get_new_data(path)
  else current_data.value = all_data.value[path] as Article_inf[]
})
</script>

<template>
  <div class="right" py-5>
    <div
      v-if="path === 'demos'"
      class="fadeInLeft"
      mx-5 w-170 flex flex-row flex-col items-center justify-center rd-2 p-5 text-left
    >
      <div>暂无</div>
      <div class="sentences">
        Sorry, I'm such a lazy and silly man.
      </div>
    </div>
    <div
      v-else-if="current_data && current_data.length "
      class="fadeInLeft"
    >
      <div
        v-for="(article_inf, i) in current_data"
        :key="i" :class="`glass ${i === 0 ? 'mb-3' : 'my-3'}`" mx-5
        w-170 flex flex-row rd-2 p-5 text-left
      >
        <div class="inf" w-115>
          <div class="date" text-3 font-400 text-clock-bg-900>
            {{ new Date(article_inf.cdate).toLocaleDateString('en', {
              month: 'long',
              day: 'numeric',
            }) }}
          </div>
          <div class="title" cursor-pointer text-5 font-400 text-clock-bg-800>
            <NuxtLink :to="`/posts/${path}/${article_inf.id.replace(/\.md$/, '')}`">
              {{ article_inf.id.replace(/\.md$/, '') }}
            </NuxtLink>
          </div>
          <div class="content-validity" mb-3 mt-1 text-4 font-400>
            {{ article_inf.title ? article_inf.title : '无内容' }}
          </div>
        <!-- <div class="comments at-you" relative flex items-center justify-start text-3>
          <span i-carbon-document-comment mx-1 inline-block h-4 w-4 />
          <span>11</span>
        </div> -->
        </div>
        <div class="img glass" h-30 w-45 bg-clock-bg-500 />
        <div class="no-photo">
          这个人很懒没有上传照片
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./LuofuStyle.css"></style>

<style scoped>
.right {
  overflow-y: scroll;
  height: 80vh;
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
  --mask-size: 1rem;
  --gradient: linear-gradient(to bottom, transparent 0%,
  white calc(var(--show-top-mask) * var(--mask-size)),
  white calc(100% - calc(var(--mask-size)*var(--show-bottom-mask))),
   transparent 100%);
  -webkit-mask: var(--gradient);
  mask: var(--gradient);
}

.no-photo {
  position: absolute;
  -webkit-text-stroke: 1px var(--clock-bg-100);
  color: transparent;
  font-size: 2rem;
  right: 0;
  top: 35%;
  rotate: -25deg;
}

.sentences {
  font-family: 'TeyvatBlack-Regular';
}
</style>
