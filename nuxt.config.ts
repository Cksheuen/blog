import path from 'node:path'
import * as fs from 'node:fs'
import axios from 'axios'
import { defineNuxtConfig } from 'nuxt/config'
import { pwa } from './config/pwa'
import { appDescription } from './constants/index'

/* const prerenderList = ['/', '/blogList', '/demoList']
const Files = ['notes', 'blogs']

const baseUrl = 'https://api.github.com/repos/cksheuen/blog_files/contents/posts'

async function getFileList(url: string) {
  const response = await axios.get(url)
  return response.data
}

async function fetchAndProcessFiles() {
  for (const file of Files) {
    const postsDirectory = path.join(baseUrl, file)
    const data = await getFileList(postsDirectory)

    data!.forEach((item: any) => {
      prerenderList.push(`posts/${file}/${item.name.replace(/\.md$/, '')}`)
    })
  }
}

await fetchAndProcessFiles().then(() => {
  console.log(prerenderList)
}) */

const prerenderList = [
  '/',
  '/blogList',
  '/demoList',
  '/posts/notes/--node.js学习笔记--',
  '/posts/notes/API',
  '/posts/notes/API接口示例',
  '/posts/notes/CSS学习笔记',
  '/posts/notes/GIT&&GitHub',
  '/posts/notes/JS——该学的逃不掉',
  '/posts/notes/JS学习笔记',
  '/posts/notes/Next.js（今天被折磨了么',
  '/posts/notes/REST 和 AJAX (包含 Fetch 和 Axios)',
  '/posts/notes/TS-Study',
  '/posts/notes/TypeScript',
  '/posts/notes/VUE3',
  '/posts/notes/first',
  '/posts/notes/hello-world',
  '/posts/notes/nuxt.js',
  '/posts/notes/title- VUE学习笔记',
  '/posts/notes/字节',
  '/posts/notes/硬件管理系统需求文档',
  '/posts/notes/第一次例会',
  '/posts/notes/第二次例会',
  '/posts/notes/跨路由组件动画',
  '/posts/notes/通过扫雷初识软件开发',
  '/posts/notes/随便记',
  '/posts/blogs/关于搭建这个blog这档事',
]

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
    '@vue-macros/nuxt',
    '@nuxt/content',
  ],
  markdownit: {
    preset: 'default',
    linkify: true,
    breaks: true,
    use: [
      'markdown-it-div',
      'markdown-it-attrs',
    ],
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    inlineSSRStyles: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  css: [
    '@unocss/reset/tailwind.css',
    '@/styles/github-markdown.css',
  ],

  colorMode: {
    classSuffix: '',
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      autoSubfolderIndex: true,
      concurrency: 1,
      interval: 0,
      failOnError: false,
      crawlLinks: false,
      retries: 3,
      retryDelay: 500,
      routes: [...prerenderList],
      ignore: ['/hi'],
    },
  },

  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/nuxt.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },

  pwa,

  devtools: {
    enabled: true,
  },
  vite: {
    plugins: [
      {
        name: 'load-glsl',
        load(id) {
          if (id.endsWith('.glsl')) {
            const content = fs.readFileSync(id, 'utf-8')
            return content
          }
        },
      },
    ],
  },
  ssr: false,
  // plugins: ['~/plugins/glslAnimation.ts'],
})
