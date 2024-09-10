import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

interface ColorMap {
  [key: number]: string
}

function generateColorVariables(type: string) {
  const colors: ColorMap = {}
  for (let i = 100; i <= 900; i += 100)
    colors[i] = `var(--clock-${type}-${1000 - i})`

  return colors
}

export default defineConfig({
  shortcuts: [
    ['btn', 'px-4 py-1 rounded inline-block bg-clock-bg-500 text-clock-text-100 cursor-pointer hover:bg-clock-bg-600 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ['icon-btn', 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600'],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'DM Sans',
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      clock: {
        text: generateColorVariables('text'),
        bg: generateColorVariables('bg'),
      },
    },
  },
})
