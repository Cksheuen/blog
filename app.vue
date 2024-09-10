<script setup lang="ts">
import { appName } from '~/constants'

const glslAnimation = useGlslAnimationStore()
useHead({
  title: appName,
})

const color = ref<string>('black')

function lightenDarkenColor(col: string, amt: number) {
  let usePound = false
  if (col[0] === '#') {
    col = col.slice(1)
    usePound = true
  }

  const num = Number.parseInt(col, 16)
  let r = (num >> 16) + amt
  let g = ((num >> 8) & 0x00FF) + amt
  let b = (num & 0x0000FF) + amt

  r = Math.min(255, Math.max(0, r))
  g = Math.min(255, Math.max(0, g))
  b = Math.min(255, Math.max(0, b))

  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0')
}

function hexToHSL(H: any) {
  let r = 0; let g = 0; let b = 0
  if (H.length === 4) {
    r = Number.parseInt(H[1] + H[1], 16)
    g = Number.parseInt(H[2] + H[2], 16)
    b = Number.parseInt(H[3] + H[3], 16)
  }
  else if (H.length === 7) {
    r = Number.parseInt(H[1] + H[2], 16)
    g = Number.parseInt(H[3] + H[4], 16)
    b = Number.parseInt(H[5] + H[6], 16)
  }
  r /= 255, g /= 255, b /= 255
  const max = Math.max(r, g, b); const min = Math.min(r, g, b)
  let h; let s; const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h! /= 6
  }

  return [h, s, l]
}

function updateClockTextColor(type: string, baseColor: string) {
  const rootStyle = document.documentElement.style
  const [_h, _s, baseLuminance] = hexToHSL(baseColor)

  // 为了避免极端亮度，设置最小和最大亮度调整量
  const minAmt = -100 // 避免太暗
  const maxAmt = 100 // 避免太亮

  for (let i = 100; i <= 900; i += 100) {
    // 计算目标亮度，但限制调整量以避免极端值
    const targetLuminance = (i - 500) / 400 + baseLuminance!
    let amt = (targetLuminance - baseLuminance!) * 255

    // 限制amt的值，避免颜色过暗或过亮
    amt = Math.max(minAmt, Math.min(maxAmt, amt))

    // 特别处理100和900，减少它们的亮度调整量，避免趋于纯黑或纯白
    if (i === 100)
      amt = amt / 2 // 使100的颜色稍微亮一些
    if (i === 900)
      amt = amt / 2 // 使900的颜色稍微暗一些

    const color = lightenDarkenColor(baseColor, amt)
    rootStyle.setProperty(`--clock-${type}-${i}`, color)
  }
}

glslAnimation.$subscribe((_e) => {
  if (color.value !== glslAnimation.now_color) {
    // document.documentElement.style.setProperty('--clock-text-color', glslAnimation.now_color)
    // document.documentElement.style.setProperty('--clock-bg-color', glslAnimation.now_bg_color)
    updateClockTextColor('text', glslAnimation.now_color)
    updateClockTextColor('bg', glslAnimation.now_bg_color)
    color.value = glslAnimation.now_color
  }
})
</script>

<template>
  <VitePwaManifest />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ClientOnly>
    <MainBg />
    <ThemeClock v-show="glslAnimation.animation_clock || glslAnimation.clock_show_state" />
  </ClientOnly>
</template>

<style>
html,
body,
html,
body,
#__nuxt {
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
}

:root {
  --clock-text-color: #fff;
  --clock-bg-color: #000;
}

@font-face {
  font-family: 'TeyvatBlack-Regular';
  src: url('/fontStyles/TeyvatBlack-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.twt {
  font-family: 'TeyvatBlack-Regular';
}
</style>
