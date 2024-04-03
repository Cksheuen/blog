import { defineStore } from 'pinia'
import * as THREE from 'three'

interface Position {
  x: number
  y: number

}

interface Gears {
  pos: THREE.Vector2
  radius: number
  out: number
  in: number
  group: number
  speed: number
}

const clock_center: Position = { x: 0.5, y: 0.5 }
const clock_radius = 0.2
const clock_pointer_width = 0.005
const clock_pointer_delta_theta = Math.atan2(clock_pointer_width, clock_radius)

function get_incision_gears(gears: Gears, theta: number, compare_radius: number, outOrIn: number) {
  const new_gears: Gears = {
    pos: new THREE.Vector2(),
    radius: 0,
    out: 0,
    in: 0,
    group: 0,
    speed: 0,
  }
  if (outOrIn === -1) {
    new_gears.radius = gears.radius / compare_radius
    new_gears.out = gears.in
    new_gears.in = gears.in / compare_radius
    new_gears.speed = gears.speed * compare_radius
  }
  else {
    new_gears.radius = gears.radius * compare_radius
    new_gears.in = gears.out
    new_gears.out = gears.out * compare_radius
    new_gears.speed = gears.speed / compare_radius
  }
  new_gears.group = 1 - gears.group
  let len = new_gears.radius - (gears.radius + gears.out + new_gears.in)
  if (outOrIn === -1)
    len = gears.radius - (new_gears.radius + new_gears.out + gears.in)

  new_gears.pos.x = gears.pos.x + Math.cos(theta) * len
  new_gears.pos.y = gears.pos.y + Math.sin(theta) * len
  return new_gears
}

function get_inscribed_gears(gears: Gears, theta: number, compare_radius: number, group: number, speed: number) {
  const new_gears: Gears = {
    pos: new THREE.Vector2(),
    radius: 0,
    out: 0,
    in: 0,
    group: 0,
    speed: 0,
  }
  new_gears.radius = gears.radius * compare_radius
  new_gears.out = gears.out
  new_gears.in = gears.in * compare_radius
  new_gears.speed = speed * (1 / compare_radius ** 2)

  new_gears.group = 1 - group
  const len = gears.radius + new_gears.out + new_gears.radius + gears.out - gears.in
  new_gears.pos.x = gears.pos.x + Math.cos(theta) * len
  new_gears.pos.y = gears.pos.y + Math.sin(theta) * len
  return new_gears
}

const u_clock_gears_pos = [
  new THREE.Vector2(0.5, 0.5),

]
const u_clock_gears_radius = [
  0.03,
]
const u_clock_gears_tooth = [
  new THREE.Vector2(0.005, 0.005),
]
const u_clock_groups = [
  0,
]
const u_clock_speed = [
  2,
]

const u_turn = [1, 1, -1, 1]

const thetas = [-Math.PI / 3 * 2.5, -Math.PI / 6]
const compares = [5, 0.5]

for (let i = 0; i < 2; i++) {
  const before_gears = {
    pos: u_clock_gears_pos[i],
    radius: u_clock_gears_radius[i],
    out: u_clock_gears_tooth[i].x,
    in: u_clock_gears_tooth[i].y,
    group: u_clock_groups[i],
    speed: u_clock_speed[i],
  }
  let new_gears
  if (i === 0) {
    new_gears = get_incision_gears(
      before_gears, // gears
      thetas[i], // theta
      compares[i], // compare_radius
      1 - i, // outOrIn
    )
  }
  else {
    new_gears = get_inscribed_gears(
      before_gears, // gears
      thetas[i], // theta
      compares[i], // compare_radius
      u_clock_groups[i], // group
      u_clock_speed[i], // speed
    )
  }
  u_clock_gears_pos.push(new_gears.pos)
  u_clock_gears_radius.push(new_gears.radius)
  u_clock_gears_tooth.push(new THREE.Vector2(new_gears.out, new_gears.in))
  u_clock_groups.push(new_gears.group)
  u_clock_speed.push(new_gears.speed)
}

u_clock_gears_pos.push(new THREE.Vector2(0.6, 0.5))
u_clock_gears_radius.push(0.2)
u_clock_gears_tooth.push(new THREE.Vector2(0.02, 0.01))
u_clock_groups.push(0)
u_clock_speed.push(1)

export const useGlslAnimationStore = defineStore('glslAnimation', () => {
  const day_time = ref<number>(new Date().getHours())
  const clock = new THREE.Clock()
  let fly_clock: THREE.Clock | null = null
  const animation_clock = ref<THREE.Clock | null>(null)
  const time_fly = ref<boolean>(false)
  const control_time = ref<boolean>(false)
  const flown_time = ref<number>(0)
  const first_stop = ref<number>(0)
  let start_time = 0
  let end_time = 0
  const animation_time = ref<number>(0)
  const animation_style = ref<number>(0)
  const before_time = ref<number>(0)
  const fade_away_time = ref<number>(0)
  const clock_show_state = ref<boolean>(false)

  function timeFlow() {
    if (time_fly.value) {
      if (start_time + flown_time.value < end_time) {
        if (fly_clock)
          flown_time.value = fly_clock.getElapsedTime() * 2
        else fly_clock = new THREE.Clock()
      }
      else {
        time_fly.value = false
        fly_clock = null
        day_time.value = (day_time.value + flown_time.value) % 24
        flown_time.value = 0
        first_stop.value = 2
      }
    }
    else {
      day_time.value += clock.getDelta() / 60 / 60
    }
  }

  function startFlyTime(new_start_time: number, new_end_time: number) {
    time_fly.value = true
    flown_time.value = 0
    start_time = new_start_time
    end_time = new_end_time
  }

  function check_stop() {
    first_stop.value--
  }

  function switchControlTimeState(new_state: boolean) {
    control_time.value = new_state
  }

  function startRouteAnimation() {
    animation_clock.value = new THREE.Clock()
    animation_style.value = 1
  }

  function endRouteAnimation() {
    before_time.value = animation_clock.value!.getElapsedTime() // shaderMaterial.uniforms.animation_time.value
    animation_time.value = 0

    animation_clock.value = new THREE.Clock()
    animation_style.value = -1

    setTimeout(() => {
      animation_clock.value = null
      animation_time.value = 0
      before_time.value = 0
      animation_style.value = 0
    }, fade_away_time.value * 1000)
  }

  function setFadeAwayTime(wx: number, wy: number) {
    fade_away_time.value = wx * wy / 1000 / 400
  }

  function setClockState(new_state: boolean) {
    clock_show_state.value = new_state
  }

  return {
    clock_center,
    clock_radius,
    clock_pointer_width,
    clock_pointer_delta_theta,
    u_clock_gears_pos,
    u_clock_gears_radius,
    u_clock_gears_tooth,
    u_clock_groups,
    u_clock_speed,
    u_turn,
    thetas,
    compares,
    day_time,
    clock,
    timeFlow,
    startFlyTime,
    time_fly,
    flown_time,
    first_stop,
    check_stop,
    control_time,
    switchControlTimeState,
    before_time,
    animation_time,
    animation_style,
    animation_clock,
    startRouteAnimation,
    endRouteAnimation,
    fade_away_time,
    setFadeAwayTime,
    clock_show_state,
    setClockState,
  }
})
