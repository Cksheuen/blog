<script setup>
import { onMounted, ref } from 'vue'
import Reveal from 'reveal.js'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import RevealMarkdown from 'reveal.js/plugin/markdown/markdown.js'
import RevealHighlight from 'reveal.js/plugin/highlight/highlight.js'
import RevealNotes from 'reveal.js/plugin/notes/notes.js'

const { data, pending, error, refresh } = await useFetch(`/api/posts/mdcontent`)

const RevealBox = ref < HTMLElement | null > (null)
const slides = ref < HTMLElement | null > (null)
const el = document.createElement('section')

onMounted(() => {
  Reveal.initialize(RevealBox.value, {
    hash: true,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
  })
  const father = document.querySelector('.slides')
  const contentArray = data.value.content.split('<hr>')
  const pageHeight = window.innerHeight
  const furtherSplitContentArray = []

  for (const content of contentArray) {
    const el = document.createElement('div')
    el.innerHTML = content

    document.body.appendChild(el)
    const elHeight = el.offsetHeight
    document.body.removeChild(el)

    if (elHeight > pageHeight) {
      // 进一步分割内容
      const subContentArray = content.split('\n\n') // 假设每个段落都由两个换行符分隔
      furtherSplitContentArray.push(...subContentArray)
    }
    else {
      furtherSplitContentArray.push(content)
    }
  }

  furtherSplitContentArray.forEach((content) => {
    const son = document.createElement('section')
    son.innerHTML = content
    father.appendChild(son)
  })
  // father.appendChild(el)
  console.log(el)
  console.log(father)
})
</script>

<template>
  <div ref="RevealBox" class="reveal">
    <div ref="slides" class="slides" />
  </div>
</template>
