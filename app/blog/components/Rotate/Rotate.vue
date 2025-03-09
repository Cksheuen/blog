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
let start_time
let end_time

let params

const glslAnimation = useGlslAnimationStore()
const { clock_center, clock_pointer_delta_theta, clock_radius, u_clock_gears_pos, u_clock_gears_radius, u_clock_gears_tooth, u_clock_groups, u_clock_speed, u_turn, clock_show_state, timeFlow } = glslAnimation

let u_resolution = new THREE.Vector2(0, 0)
const u_block = new THREE.Vector2(50, 50)

let renderTargets

function createPlane() {
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { type: 'f', value: 0.0 },
      u_resolution: { type: 'v2', value: u_resolution },
      u_day_time: { type: 'f', value: glslAnimation.day_time },
      u_clock_gears_pos: { type: 'v2v', value: u_clock_gears_pos },
      u_clock_gears_radius: { type: 'fv1', value: u_clock_gears_radius },
      u_clock_gears_tooth: { type: 'v2v', value: u_clock_gears_tooth },
      u_clock_groups: { type: 'iv1', value: u_clock_groups },
      u_clock_speed: { type: 'fv1', value: u_clock_speed },
      u_turn: { type: 'iv1', value: u_turn },
      u_fly_time: { type: 'f', value: 0.0 },
      u_control_time: { type: 'f', value: 0.0 },
      animation_time: { type: 'f', value: 0.0 },
      animation_style: { type: 'i', value: -1 },
      before_time: { type: 'f', value: 0.0 },
      u_block: { type: 'v2', value: u_block },
      u_fade_away_time: { type: 'f', value: 2.0 },
    },
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  },
  )
  shaderMaterial.depthTest = false
  shaderMaterial.blending = THREE.AdditiveBlending

  basicMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    transparent: true, // 启用透明度
    // opacity: 0.5, // 设置透明度为0.5
    blending: THREE.AdditiveBlending, // 设置混合模式为加性混合
    depthTest: false, // 关闭深度测试
    alphaTest: 0.5, // 设置透明度阈值
  })

  const planeGeometry = new THREE.PlaneGeometry(2, 2)
  const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial)
  const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial)
  planeBasic.renderOrder = 1
  planeShader.renderOrder = 2
  // planeShader.renderOrder = 1
  sceneBasic.add(planeBasic)
  sceneShader.add(planeShader)
}
function render() {
  shaderMaterial.uniforms.u_time.value = clock.getElapsedTime()

  timeFlow()

  shaderMaterial.uniforms.u_day_time.value = glslAnimation.day_time

  if (glslAnimation.time_fly)
    shaderMaterial.uniforms.u_fly_time.value = glslAnimation.flown_time

  if (glslAnimation.first_stop > 0) {
    shaderMaterial.uniforms.u_day_time.value = glslAnimation.day_time
    shaderMaterial.uniforms.u_fly_time.value = 0
    shaderMaterial.uniforms.u_control_time.value = 0

    glslAnimation.check_stop()
  }

  if (glslAnimation.animation_clock) {
    shaderMaterial.uniforms.animation_time.value = glslAnimation.animation_clock.getElapsedTime()
    shaderMaterial.uniforms.animation_style.value = glslAnimation.animation_style
  }
  else {
    shaderMaterial.uniforms.animation_time.value = 0
    shaderMaterial.uniforms.before_time.value = 0
    shaderMaterial.uniforms.animation_style.value = 0
  }

  renderer.setRenderTarget(renderTargets[1])
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
  glslAnimation.setFadeAwayTime(window.innerWidth, window.innerHeight)
  shaderMaterial.uniforms.u_fade_away_time.value = glslAnimation.fade_away_time
}

function cursor_over(e, window) {
  const st = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }

  const dist = Math.sqrt(((st.x - clock_center.x) * params) ** 2 + (st.y - clock_center.y) ** 2)
  let theta = Math.atan2((st.y - clock_center.y), (st.x - clock_center.x) * params)
  theta = (theta + 2.5 * Math.PI) % (Math.PI * 2)
  const time_theta = glslAnimation.day_time / 12 * Math.PI
  const low = (time_theta - clock_pointer_delta_theta * 10 + 2 * Math.PI) % (2 * Math.PI)
  const high = (time_theta + clock_pointer_delta_theta * 10 + 2 * Math.PI) % (2 * Math.PI)
  if (dist <= clock_radius
    && theta >= low
    && theta <= high || high < low && (theta >= low || theta <= high))
    return true

  return false
}

onMounted(() => {
  params = window.innerWidth / window.innerHeight
  u_resolution = new THREE.Vector2(window.innerWidth, window.innerHeight)

  glslAnimation.setFadeAwayTime(window.innerWidth, window.innerHeight)

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
  })
  renderer.setClearColor(0xFFFFFF, 0)
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
  shaderMaterial.uniforms.u_fade_away_time.value = glslAnimation.fade_away_time

  window.addEventListener('resize', () => {
    updateSize()
  })

  window.addEventListener('mousedown', (e) => {
    if (cursor_over(e, window) && glslAnimation.clock_show_state)
      glslAnimation.switchControlTimeState(true)
  })
  window.addEventListener('mouseup', (e) => {
    if (glslAnimation.control_time && glslAnimation.clock_show_state) {
      const st = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      let theta = Math.atan2(st.y - clock_center.y, (st.x - clock_center.x) * params)
      theta = (theta + 2.5 * Math.PI) % (Math.PI * 2)

      start_time = glslAnimation.day_time
      end_time = (theta / Math.PI * 12) % 24
      if (start_time > end_time)
        end_time += 24
      glslAnimation.startFlyTime(start_time, end_time)
      glslAnimation.switchControlTimeState(false)
    }
  })
  window.addEventListener('mousemove', (e) => {
    if (!glslAnimation.clock_show_state)
      return
    if (cursor_over(e, window))
      document.body.style.cursor = 'pointer'
    else
      document.body.style.cursor = 'default'
    if (glslAnimation.control_time) {
      const st = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
      let theta = Math.atan2(st.y - clock_center.y, (st.x - clock_center.x) * params)
      theta = (theta + 2.5 * Math.PI) % (Math.PI * 2)

      shaderMaterial.uniforms.u_control_time.value = (theta / Math.PI * 12) % 24
    }
  })
})
</script>

<template>
  <div class="container" absolute z-15>
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
