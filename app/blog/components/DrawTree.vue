<script setup lang="ts">
const WIDTH = 1860
const HEIGHT = 972
const el = $ref<HTMLCanvasElement>()
const ctx = $computed(() => el!.getContext('2d')!)

onMounted(() => {
  init(0, HEIGHT, -Math.PI / 4)
  init(WIDTH, 0, Math.PI / 3 * 2)
  startFrame()
})

interface Point {
  x: number
  y: number
}

interface Branch {
  start: Point
  length: number
  theta: number
}

interface Frame {
  fn: Function
  num: number
  sliceBranch: Branch
}

function init(x: number, y: number, theta: number) {
  ctx.strokeStyle = 'rgba(156,163,175,0.8)'
  ctx.lineWidth = 0.5
  const branch: Branch = {
    start: {
      x,
      y,
    },
    length: Math.random() * 10,
    theta,
  }
  slice(branch, 1)
}

const maxDepth = 81
const cen = 0.05

function create(branch: Branch, depth: number) {
  const end = getEndPoint(branch)
  // drawBranch(branch)
  if (depth < maxDepth || Math.random() < cen) {
    slice({
      start: end,
      length: Math.random() * 30,
      theta: branch.theta - Math.random() * 0.4,
    }, depth + 1)
  }
  if (depth < maxDepth || Math.random() < cen) {
    slice({
      start: end,
      length: Math.random() * 30,
      theta: branch.theta + Math.random() * 0.4,
    }, depth + 1)
  }
}

let pendingTasks: Frame[] = []

const maxBranchNum = 30

function slice(branch: Branch, depth: number) {
  const sliceBranch: Branch = { ...branch, length: 1 }
  const num: number = Math.ceil(branch.length)
  pendingTasks.push({
    fn: (bewBranch: Branch) => pendingTasks.length <= maxBranchNum && create(bewBranch, depth + 1),
    num,
    sliceBranch,
  })
}

let rafId: any = null
let count = 0
const per = 4
function startFrame() {
  let t: number = 0
  const pre: Frame[] = pendingTasks
  rafId = requestAnimationFrame(() => {
    if (count % per === 0) {
      pendingTasks = pendingTasks.map((item: Frame) => {
        drawBranch(item.sliceBranch)
        if (item.num - 1 === 0)
          item.fn(item.sliceBranch)
        const branch: Branch = {
          ...item.sliceBranch,
          start: getEndPoint(item.sliceBranch),
        }
        return { ...item, num: item.num - 1, sliceBranch: branch }
      })

      pendingTasks = pendingTasks.filter((item: Frame) => {
        if (!(item.num !== 0))
          t = 1
        return item.num !== 0
      })
      if (t === 1)
        pendingTasks = pre.filter(item => item.num !== 1)
      if (pendingTasks.length === 0)
        cancelAnimationFrame(rafId)
      count = 0
    }
    count++
    startFrame()
  })
}

function getEndPoint(b: Branch): Point {
  return {
    x: b.start.x + Math.cos(b.theta) * b.length,
    y: b.start.y + Math.sin(b.theta) * b.length,
  }
}

function drawBranch(b: Branch) {
  lineTo(b.start, getEndPoint(b))
}

function lineTo(startPoint: Point, endPoint: Point) {
  ctx.beginPath()
  ctx.moveTo(startPoint.x, startPoint.y) // 设置起点
  ctx.lineTo(endPoint.x, endPoint.y) // 绘制直线
  ctx.stroke()
}
</script>

<template>
  <!-- <canvas  width="600" height="600" /> -->
  <canvas ref="el" z-0 width="1860" height="927" style="width: 1488px; height: 742px;" />
</template>
