#ifdef GL_ES
precision mediump float;
#endif

#define PI 3.14159265359
#define CLOCK_RADIUS 0.2
#define CLOCK_POS vec2(.5, .5)
#define GEARS_NUM 4

uniform vec2 u_resolution;
uniform float u_day_time;
uniform float u_time;
uniform float u_fly_time;
uniform float u_control_delta_time_theta;
uniform float u_control_time;
uniform float animation_time;
uniform float before_time;
uniform int animation_style;

uniform vec2 u_clock_gears_pos[GEARS_NUM];
uniform float u_clock_gears_radius[GEARS_NUM];
uniform vec2 u_clock_gears_tooth[GEARS_NUM];
uniform float u_clock_groups[GEARS_NUM];
uniform float u_clock_speed[GEARS_NUM];
uniform float u_turn[GEARS_NUM];

uniform vec2 u_block;
uniform float u_fade_away_time;

// Some useful functions
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

//
// Description : GLSL 2D simplex noise function
//      Author : Ian McEwan, Ashima Arts
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License :
//  Copyright (C) 2011 Ashima Arts. All rights reserved.
//  Distributed under the MIT License. See LICENSE file.
//  https://github.com/ashima/webgl-noise
//
float snoise(vec2 v) {

  // Precompute values for skewed triangular grid
  const vec4 C = vec4(0.211324865405187,
                      // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,
                      // 0.5*(sqrt(3.0)-1.0)
                      -0.577350269189626,
                      // -1.0 + 2.0 * C.x
                      0.024390243902439);
  // 1.0 / 41.0

  // First corner (x0)
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  // Other two corners (x1, x2)
  vec2 i1 = vec2(0.0);
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0.xy + C.xx - i1;
  vec2 x2 = x0.xy + C.zz;

  // Do some permutations to avoid
  // truncation effects in permutation
  i = mod289(i);
  vec3 p =
      permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);

  m = m * m;
  m = m * m;

  // Gradients:
  //  41 pts uniformly over a line, mapped onto a diamond
  //  The ring size 17*17 = 289 is close to a multiple
  //      of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  // Normalise gradients implicitly by scaling m
  // Approximation of: m *= inversesqrt(a0*a0 + h*h);
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  // Compute final noise value at P
  vec3 g = vec3(0.0);
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
  return 130.0 * dot(m, g);
}

#define OCTAVES 3
float turbulence(in vec2 st) {
  // Initial values
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
  //
  // Loop of octaves
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * abs(snoise(st));
    st *= 2.;
    amplitude *= .5;
  }
  return value;
}

float random(in vec2 _st) {
  return fract(sin(dot(_st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 _st) {
  vec2 i = floor(_st);
  vec2 f = fract(_st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm(in vec2 _st) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(_st);
    _st = rot * _st * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

vec3 rgb(float r, float g, float b) {
  return vec3(r / 255.0, g / 255.0, b / 255.0);
}

float slow(float x, float a) {
  if (x < .5) {
    return pow(2. * x, a) / 2.;
  } else {
    return 1. - pow(2. * (1. - x), a) / 2.;
  }
}

vec3 getSkyColor(float time) {
  vec3 dawnColor = vec3(0.7, 0.5, 0.4);
  vec3 noonColor = vec3(0.2, 0.5, 0.9);
  vec3 duskColor = vec3(0.7, 0.4, 0.2);
  vec3 nightColor = vec3(0.1, 0.1, 0.2);

  float t = mod(time, 24.0); // 模拟一天24小时
  // float t = time;
  if (t < 6.0) {
    return mix(nightColor, dawnColor, pow(t / 6., 6.));
  } else if (t < 12.0) {
    return mix(dawnColor, noonColor, (t - 6.0) / 6.0);
  } else if (t < 18.0) {
    return mix(noonColor, duskColor, pow(((t - 12.0) / 6.0), 6.));
  } else {
    return mix(duskColor, nightColor, pow((t - 18.0) / 6.0, 1. / 8.));
  }
}

float d_width(float theta, float width, float percent) {
  return smoothstep(.2, .8,
                    sin(theta * pow((1. - width) * 10., 4.) / 200.) * .5 + .5) *
             width * percent +
         1. - width * percent;
}

float atan2(float y, float x) {
  float t;
  if (abs(x) > abs(y)) {
    t = atan(y / x);
    if (x < 0.0) {
      if (y >= 0.0)
        t += PI;
      else
        t -= PI;
    }
  } else {
    t = -atan(x / y);
    if (y < 0.0)
      t += PI;
  }
  return t;
}

float dis_h(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float get_clock_pointer_shape(float over, vec2 st, float cal_time,
                              float radius) {
  float time = cal_time + PI / 2.;
  float w = .005;
  float dist = distance(st, CLOCK_POS);
  vec2 diff = st - CLOCK_POS;
  float theta = atan(diff.y, diff.x);
  theta = mod(theta + 2.0 * PI, 2.0 * PI);
  vec2 pointer_head = CLOCK_POS + vec2(radius * cos(time), radius * sin(time));
  float h = dis_h(st, CLOCK_POS, pointer_head);

  vec2 p = vec2(h / w, dist / radius);
  if (p.y > .5)
    p.y = 1. - p.y;
  float f = fbm(p);
  float pointer_noise = f / 10. * over;
  pointer_noise *= pow(slow(1. - smoothstep(0., 1., dist / radius), 0.1), 1.5);
  float pointer_point_time =
      mod(-time + 2. * PI * (1. - smoothstep(-1., 1., pointer_noise)), 2. * PI);
  pointer_head = CLOCK_POS + vec2(radius * cos(pointer_point_time),
                                  radius * sin(pointer_point_time));

  h = dis_h(st, CLOCK_POS, pointer_head);

  w -= smoothstep(0., 1., pow(p.y, 2.)) * w;
  float clock_pointer = fbm(st * p + vec2(sin(u_time), cos(u_time))) * 2.;
  clock_pointer *= 1. - smoothstep(0., w, h);
  clock_pointer *= smoothstep(-w, 0., h);

  return clock_pointer;
}

vec3 get_bg_color(float day_time, float f, vec2 q, float theta, float turn_r,
                  float turn_direction) {
  vec2 st = gl_FragCoord.xy / u_resolution.xy * smoothstep(0., 10., day_time);
  vec3 color = vec3(0.0);
  float dt = fract(turn_direction) * 2. - 1.;
  st.x = st.x * sin(theta) - st.y * cos(theta) * dt;
  st.y = st.y * sin(theta) + st.y * cos(theta) * dt;

  vec2 r = vec2(0.);
  r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
  r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

  vec3 color1 = vec3(0.101961, 0.619608, 0.666667); // 偏蓝绿色 —— 背景
  vec3 color2 = vec3(0.455556, 0.455556, 0.356473); // 偏灰色 —— 云组成部分1
  vec3 color3 = vec3(0, 0, 0.164706); // 深蓝色 —— 云组成部分2 —— 天空映射
  vec3 color4 = vec3(0.666667, 1., 1.); // 偏天蓝色 —— 总体减少红色部分

  color = mix(color1, color2, clamp((f * f) * 4.0, 0.0, 1.0));

  float test_time = mod(day_time, 24.);

  float t = 2. / 24. * test_time - 1.2;
  if (t < -1.)
    t = 1. - (-1. - t);
  float move = .1;
  if (t < 0.)
    t = clamp(-1., 0., t - move);
  else
    t = clamp(0., 1., t);
  t = abs(t);

  vec3 sky_color = getSkyColor(test_time);

  color = mix(color, sky_color * 0.5, clamp(length(q), 0.0, 1.0));

  color = mix(color, color4, clamp(length(r.x), 0.0, 1.0));

  color = mix(color, sky_color, smoothstep(0., 1., slow(t, 0.624)));

  float smoothTheta = theta;

  smoothTheta = sin(smoothTheta) * cos(smoothTheta) * 2.;

  st = vec2(smoothstep(0., 1., (turn_r - CLOCK_RADIUS) / (1. - CLOCK_RADIUS)),
            smoothstep(0., 1., smoothTheta / PI / 2.));

  // vec3 animation_color = vec3(pow(turbulence(st * pow(turn_r, .1)
  // * 10.), 2.));
  f = fbm(st * pow(turn_r, .1) * 10.);
  // if (f > theta - (.1 - turn_r) && f < theta + (.1 - turn_r))
  color = mix(color, vec3(1.), f);
  return color;
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  st.x *= u_resolution.x / u_resolution.y;
  st.x += (1. - u_resolution.x / u_resolution.y) / 2.;

  float dist = distance(CLOCK_POS, st);
  float circle = pow(1. - distance(CLOCK_POS, st), 8.);
  float edge = smoothstep(CLOCK_RADIUS, CLOCK_RADIUS + 0.01, dist);

  float time_fix = animation_style == 1 ? 0. : 1.;
  if (animation_style == 1)
    time_fix = 1.;
  else if (animation_style == -1)
    time_fix = u_fade_away_time;

  float animation_area = smoothstep(0., time_fix, animation_time);
  dist = slow(smoothstep(CLOCK_RADIUS, 1., dist), .2);

  if (dist > animation_area + .1 && animation_style != -1) {
    return;
  }
  vec3 color;
  float day_time = mod(u_day_time + u_fly_time, 24.);
  float control_day_time = u_control_time;
  if (u_control_time == 0.)
    control_day_time = u_day_time;

  float speed[GEARS_NUM];

  for (int i = 0; i < GEARS_NUM; i++) {
    if (u_fly_time > 0.) {
      speed[i] = u_clock_speed[i] * 10.;
    } else {
      speed[i] = u_clock_speed[i];
    }
  }

  vec2 q = vec2(0.);
  q.x = fbm(st + 0.00 * u_time);
  q.y = fbm(st + vec2(1.0));

  vec2 r = vec2(0.);
  r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
  r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

  float f = fbm(st + r);

  float clock_hour_hand, clock_minute_hand;
  float clock_hour_hand_theta = mod(control_day_time / 12. * PI, 2. * PI);
  float clock_minute_hand_theta = mod(day_time / 12. * PI, 2. * PI);

  float theta =
      mod(-atan(st.y - CLOCK_POS.y, st.x - CLOCK_POS.x) + PI * 2.5, PI * 2.);
  float transparent = 1.;

  if (animation_style == 1) {
    float turn_r = distance(st, CLOCK_POS);
    color = get_bg_color(day_time, f, q,
                         mod(theta + animation_time + 2. * PI, 2. * PI),
                         // * (2. * PI - mod(theta + animation_time, 2. * PI)),
                         turn_r, mod(animation_time, 2.));
  } else if (animation_style == -1) {
    st.x *= u_resolution.x / u_block.x;
    st.y *= u_resolution.y / u_block.y;
    animation_area = 1. - animation_area; // 1 - 0
    animation_area *=
        (u_resolution.x / u_block.x) * (u_resolution.y / u_block.y);
    int animation_area_num = int(floor(animation_area));
    int st_area_num = int(floor(st.y) * (u_resolution.x / u_block.x) +
                          floor(u_resolution.x / u_block.x - st.x));
    if (st_area_num > animation_area_num) {
      int dist = st_area_num - animation_area_num;

      if (dist > 0)
        transparent =
            1. - float(smoothstep(
                     0., 1., float(dist) / 2. / (u_resolution.x / u_block.x)));
    }

    st.x /= u_resolution.x / u_block.x;
    st.y /= u_resolution.y / u_block.y;
    float turn_r = distance(st, CLOCK_POS);
    color = get_bg_color(
        day_time, f, q,
        mod(theta + animation_time + before_time + 2. * PI, 2. * PI),
        // * (2. * PI - mod(theta + animation_time, 2. * PI)),
        turn_r, mod(animation_time + before_time, 2.));
  }
  if (edge < 1.) {
    vec3 color_no_clock = mix(color, vec3(0.1, 0.1, 0.1), circle);
    float params = 0.;
    for (int i = GEARS_NUM - 1; i >= 0; i--) {
      vec3 clock_color = vec3(pow(float(i), 4.) / 10.);
      clock_color = mix(clock_color, vec3(0.1, 0.1, 0.1), .5);
      vec2 gears_pos = u_clock_gears_pos[i];
      float gears_radius = u_clock_gears_radius[i];

      float dist = distance(st, gears_pos);
      float theta = atan2(st.y - gears_pos.y, st.x - gears_pos.x) +
                    u_time / 10. * speed[i] * u_turn[i] +
                    u_clock_groups[i] * PI / 2.;
      float percent = 2. * (1. - gears_radius);
      if (dist < (gears_radius + u_clock_gears_tooth[i].x) *
                     d_width(theta, u_clock_gears_tooth[i].x, percent) &&
          dist > (gears_radius - u_clock_gears_tooth[i].y) *
                     d_width(theta, u_clock_gears_tooth[i].y, percent)) {
        params = .8;
      }
      vec2 mid = vec2(1.) - u_clock_gears_tooth[i] * percent * 10.;
      if (dist < gears_radius + u_clock_gears_tooth[i].x * mid.x &&
          dist > gears_radius - u_clock_gears_tooth[i].y * mid.y) {
        theta -= u_turn[i] * 2. * speed[i] * u_time;
        theta = mod(theta, PI * 2.);
        vec2 p = vec2((dist - (gears_radius - u_clock_gears_tooth[i].y)) /
                          (gears_radius - u_clock_gears_tooth[i].y +
                           u_clock_gears_tooth[i].x - gears_radius),
                      theta / (PI * 2.));

        clock_color = vec3(
            pow(turbulence(p * pow(u_clock_gears_radius[i], .1) * 10.), 2.));
        params = .6;
      }
      params += (1. - float(i) / float(GEARS_NUM)) * .1;

      color = mix(color, clock_color, params);
    }

    color = (f * f * f + .6 * f * f + .5 * f) * color;
    if (edge > .1) {

      color = f * color;
      if (theta > clock_minute_hand_theta && theta < clock_hour_hand_theta ||
          (theta > clock_minute_hand_theta && theta < PI * 2. ||
           theta < clock_hour_hand_theta) &&
              clock_minute_hand_theta > clock_hour_hand_theta) {
        color = vec3(getSkyColor(theta / PI * 12.));
      }
    }
  }

  for (int i = -1; i < 2; i++) {
    clock_hour_hand += get_clock_pointer_shape(
        float(i), st, clock_hour_hand_theta, CLOCK_RADIUS);
    clock_minute_hand += get_clock_pointer_shape(
        float(i), st, clock_minute_hand_theta, CLOCK_RADIUS * .7);
  }

  color *= 1. - clock_minute_hand;

  color *= 1. - clock_hour_hand;

  gl_FragColor = vec4(color, transparent);
}