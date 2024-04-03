// const glslAnimation = useGlslAnimationStore()

export default defineNuxtRouteMiddleware(() => {
//   glslAnimation.startRouteAnimation()

  if (process.client) {
    const glslAnimation = useGlslAnimationStore()
    glslAnimation.startRouteAnimation()
    if (document.readyState === 'complete') {
      glslAnimation.endRouteAnimation()
    }
    else {
      window.addEventListener('load', () => {
        glslAnimation.endRouteAnimation()
      })
    }
  }
})
