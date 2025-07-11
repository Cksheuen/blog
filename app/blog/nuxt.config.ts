import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'
import wasm from 'vite-plugin-wasm'
import { pwa } from './config/pwa'
import { appDescription } from './constants/index'

export default defineNuxtConfig({
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    // '@vite-pwa/nuxt',
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
      wasm(),
    ],
    build: {
      target: 'esnext',
      rollupOptions: {
        external: ['wasm_scene'],
      },
    },
    optimizeDeps: {
      exclude: ['wasm_scene'],
    },
    worker: {
      format: 'es',
      plugins: () => [
        wasm(),
      ],
    },
  },

  // plugins: ['~/plugins/glslAnimation.ts'],
  ssr: true,
  compatibilityDate: '2025-03-09',
})
