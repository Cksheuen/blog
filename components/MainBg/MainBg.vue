<script setup>
import * as THREE from 'three'
import vertexShader from './vertexShader.glsl?raw'
import fragmentShader from './fragmentShader.glsl?raw'

const canvasEl = $ref()

let basicMaterial, shaderMaterial
let renderer
let sceneShader
let sceneBasic
let camera
const clock = new THREE.Clock()

const glslAnimation = useGlslAnimationStore()

const { u_clock_gears_pos, u_clock_gears_radius, u_clock_gears_tooth, u_clock_groups, u_clock_speed, u_turn } = glslAnimation

let u_resolution

let renderTargets

function createPlane() {
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { type: 'f', value: 0.0 },
      u_resolution: { type: 'v2', value: u_resolution },
      u_day_time: { type: 'f', value: glslAnimation.day_time.value },
      u_clock_gears_pos: { type: 'v2v', value: u_clock_gears_pos },
      u_clock_gears_radius: { type: 'fv1', value: u_clock_gears_radius },
      u_clock_gears_tooth: { type: 'v2v', value: u_clock_gears_tooth },
      u_clock_groups: { type: 'iv1', value: u_clock_groups },
      u_clock_speed: { type: 'fv1', value: u_clock_speed },
      u_turn: { type: 'iv1', value: u_turn },
      u_fly_time: { type: 'f', value: 0.0 },
      u_control_time: { type: 'f', value: glslAnimation.day_time.value },
    },
    vertexShader,
    fragmentShader,
  })
  basicMaterial = new THREE.MeshBasicMaterial()
  const planeGeometry = new THREE.PlaneGeometry(2, 2)
  const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial)
  const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial)
  sceneBasic.add(planeBasic)
  sceneShader.add(planeShader)
}

function render() {
  shaderMaterial.uniforms.u_time.value = clock.getElapsedTime()
  shaderMaterial.uniforms.u_day_time.value = glslAnimation.day_time

  /* time.value = shaderMaterial.uniforms.u_time.value % 24.0

  if (!control_time && !time_fly) { glslAnimation.day_time.value += clock.getDelta() / 60 }
  else if (time_fly) {
    if (start_time + shaderMaterial.uniforms.u_fly_time.value < end_time) {
      if (!fly_clock)
        fly_clock = new THREE.Clock()
      shaderMaterial.uniforms.u_fly_time.value = fly_clock.getElapsedTime() * 2
    }
    else {
      shaderMaterial.uniforms.u_glslAnimation.day_time.value = glslAnimation.day_time.value
      shaderMaterial.uniforms.u_fly_time.value = 0
      time_fly = false
      fly_clock = null
    }
  } */
  if (!glslAnimation.control_time && !glslAnimation.time_fly)
    shaderMaterial.uniforms.u_day_time.value = glslAnimation.day_time

  if (glslAnimation.time_fly)
    shaderMaterial.uniforms.u_fly_time.value = glslAnimation.flown_time

  if (glslAnimation.first_stop) {
    shaderMaterial.uniforms.u_day_time.value = glslAnimation.day_time
    shaderMaterial.uniforms.u_fly_time.value = 0
  }

  renderer.setRenderTarget(renderTargets[1]) // 双缓冲
  renderer.render(sceneShader, camera)
  basicMaterial.map = renderTargets[1].texture
  renderer.setRenderTarget(null)
  renderer.render(sceneBasic, camera)

  const tmp = renderTargets[0]
  renderTargets[0] = renderTargets[1]
  renderTargets[1] = tmp

  requestAnimationFrame(render)
}

function updateSize() {
  renderer.setSize(window.innerWidth, window.innerHeight)
  u_resolution.set(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  u_resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  sceneShader = new THREE.Scene()
  sceneBasic = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)

  renderTargets = [
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  ]

  createPlane()
  updateSize()
  render()

  window.addEventListener('resize', () => {
    updateSize()
  })
})
</script>

<template>
  <div class="container" absolute z--1>
    <canvas ref="canvasEl" />
  </div>
</template>

<style scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column-reverse;
  align-items: start;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

@media all and (min-width: 640px) {
  .name {
    font-size: 45px
  }
}
</style>
