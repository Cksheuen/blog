<script setup>
import * as THREE from 'three'
import vertexShader from './vertexShader.glsl?raw'
import fragmentShader from './fragmentShader.glsl?raw'

const canvasEl = $ref()
const cleanBtn = $ref()

// flower position
const pointer = {
  x: 0.0,
  y: 0.0,
  clicked: false,
  vanishCanvas: false,
}

let basicMaterial, shaderMaterial
let renderer
let sceneShader
let sceneBasic
let camera
let clock

let renderTargets

const isTouchScreen = false

let totalBranches = 0
const maxBranchNum = 300
const BranchLen = 20
const BranchMin = 30
const branches = []
const minDepth = 30
const deltaTheta = 0.5
const beforeLens = []
const percent = 0.3
const roots = []
const rootParams = [1.0, 1.0, 1.0, 1.0]
const BloomPercent = 0.7
const MinBloomLen = 50
const places = [
  {
    x: 0,
    y: 0,
  },
  {
    x: window.innerWidth,
    y: 0,
  },
  {
    x: 0,
    y: 0,
  },
  {
    x: 0,
    y: window.innerHeight,
  },
]

function getEndPoint(b) {
  return {
    x: b.start.x + Math.cos(b.theta) * b.length,
    y: b.start.y + Math.sin(b.theta) * b.length,
  }
}

function Blooms(newBranch) {
  setTimeout(() => {
    const percent = Math.random() * 0.5
    const flowerX = newBranch.start.x + Math.cos(newBranch.theta) * newBranch.length * percent
    const flowerY = newBranch.start.y + Math.sin(newBranch.theta) * newBranch.length * percent
    pointer.x = flowerX / window.innerWidth
    pointer.y = flowerY / window.innerHeight
    pointer.clicked = true
  }, 5000)
}

function createPlum() {
  const newPlum = []
  const root = {
    start: {
      x: 0,
      y: 0,
    },
  }

  let max = 0
  let index = 0
  for (let i = 0; i < 4; i++) {
    if (Math.random() * rootParams[i] > max) {
      index = i
      max = Math.random()
    }
  }
  root.start = places[index]
  if (index < 2)
    root.start.y = Math.random() * window.innerHeight
  else root.start.x = Math.random() * window.innerWidth
  rootParams[index] *= 0.5

  root.theta = Math.atan2(window.innerHeight / 2 - root.start.y, window.innerWidth / 2 - root.start.x)
  // root.theta = Math.random() * Math.PI / 2 + Math.PI / 4
  root.length = Math.random() * BranchLen + BranchMin
  root.beforeLen = 0
  roots.push(root)
  totalBranches++
  const end = getEndPoint(root)
  newPlum.push(new THREE.Vector4(root.start.x, root.start.y, end.x, end.y))
  const newBranches = [root]
  let depth = 0
  while (newBranches.length > 0 && totalBranches < maxBranchNum) {
    depth++
    const branch = newBranches.pop()
    const end = getEndPoint(branch)
    if ((Math.random() < percent || depth < minDepth) && totalBranches < maxBranchNum) {
      const newBranch = {
        start: end,
        length: Math.random() * BranchLen + BranchMin,
        theta: branch.theta - Math.random() * deltaTheta,
        beforeLen: branch.beforeLen + branch.length,
      }
      totalBranches++
      const newEnd = getEndPoint(newBranch)
      newPlum.push(new THREE.Vector4(newBranch.start.x, newBranch.start.y, newEnd.x, newEnd.y))
      beforeLens.push(newBranch.beforeLen)
      newBranches.unshift(newBranch)
      if (Math.random() < BloomPercent && newBranch.length > MinBloomLen)
        Blooms(newBranch)
    }
    if ((Math.random() < percent || depth < minDepth) && totalBranches < maxBranchNum) {
      const newBranch = {
        start: end,
        length: Math.random() * BranchLen + BranchMin,
        theta: branch.theta + Math.random() * deltaTheta,
        beforeLen: branch.beforeLen + branch.length,
      }
      totalBranches++
      const newEnd = getEndPoint(newBranch)
      newPlum.push(new THREE.Vector4(newBranch.start.x, newBranch.start.y, newEnd.x, newEnd.y))
      beforeLens.push(newBranch.beforeLen)
      newBranches.unshift(newBranch)
      if (Math.random() < BloomPercent && newBranch.length > MinBloomLen)
        Blooms(newBranch)
    }
  }
  return newPlum
}

function cleanCanvas() {
  pointer.vanishCanvas = true
  setTimeout(() => {
    pointer.vanishCanvas = false
  }, 50)
}

function createPlane() {
  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { type: 'f', value: 0.0 },
      u_stop_time: { type: 'f', value: 0.0 },
      // 随机二维向量
      u_stop_randomizer: { type: 'v2', value: new THREE.Vector2(Math.random(), Math.random()) },
      // 鼠标点击位置
      u_cursor: { type: 'v2', value: new THREE.Vector2(pointer.x, pointer.y) },
      // 视图宽高比
      u_ratio: { type: 'f', value: window.innerWidth / window.innerHeight },
      u_texture: { type: 't', value: null },
      u_clean: { type: 'f', value: 1.0 },
      u_branches: { type: 'v4v', value: branches },
      u_before_lens: { type: 'fv1', value: beforeLens },
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
  shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 0 : 1
  shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture
  shaderMaterial.uniforms.u_time.value = clock.getElapsedTime()

  if (pointer.clicked) {
    shaderMaterial.uniforms.u_cursor.value = new THREE.Vector2(pointer.x, 1 - pointer.y)
    shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(Math.random(), Math.random())
    shaderMaterial.uniforms.u_stop_time.value = 0.0
    pointer.clicked = false
  }
  shaderMaterial.uniforms.u_stop_time.value += clock.getDelta()

  renderer.setRenderTarget(renderTargets[1]) // 双缓冲？
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
  shaderMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight
  renderer.setSize(window.innerWidth, window.innerHeight)
  places[1].x = window.innerWidth
  places[3].y = window.innerHeight
}

onMounted(() => {
  while (totalBranches < maxBranchNum)
    branches.push(...createPlum())
  branches.forEach((branch) => {
    branch.x /= window.innerWidth
    branch.y /= window.innerHeight
    branch.z /= window.innerWidth
    branch.w /= window.innerHeight
  })

  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    alpha: true,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  sceneShader = new THREE.Scene()
  sceneBasic = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10)
  clock = new THREE.Clock()

  renderTargets = [
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
    new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  ]

  createPlane()
  updateSize()
  render()
  window.addEventListener('click', (e) => {
    if (!isTouchScreen) {
      // normalize
      pointer.x = e.pageX / window.innerWidth
      pointer.y = e.pageY / window.innerHeight
      pointer.clicked = true
    }
  })

  window.addEventListener('resize', () => {
    updateSize()
    cleanCanvas()
  })
})
</script>

<template>
  <div class="container">
    <canvas ref="canvasEl" />
    <div ref="cleanBtn" @click="cleanCanvas">
      clean the screen
    </div>
  </div>
</template>

<style scoped>
html,
body {
  overflow: hidden;
  padding: 0;
  margin: 0;
}

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

.clean-btn {
  z-index: 1;
  font-family: sans-serif;
  font-size: 15px;
  color: white;
  text-shadow: 0 0 10px #aaa2a2;
  user-select: none;
  padding: 0 0 15px 25px;
  cursor: pointer;
  text-decoration: underline;
  opacity: .5;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
}

.name {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100%;
  transform: translate(-50%, -50%);
  color: white;
  text-align: center;
  font-size: 4vw;
  text-shadow: 0 0 5px #000000;
  user-select: none;
  pointer-events: none;
}

@media all and (min-width: 640px) {
  .name {
    font-size: 45px
  }
}
</style>
