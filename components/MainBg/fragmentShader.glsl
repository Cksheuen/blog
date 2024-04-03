#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_day_time;
uniform float u_time;
uniform float u_fly_time;
uniform float u_control_time;

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

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution.xy * 3.;
  // st += st * abs(sin(u_time*0.1)*3.0);
  vec3 color = vec3(0.0);
  float day_time = mod(u_day_time + u_fly_time, 24.);

  vec2 q = vec2(0.);
  q.x = fbm(st + 0.00 * u_time);
  q.y = fbm(st + vec2(1.0));

  vec2 r = vec2(0.);
  r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
  r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

  float f = fbm(st + r);
  vec3 color1 = vec3(0.101961, 0.619608, 0.666667); // 偏蓝绿色 —— 背景
  vec3 color2 = vec3(0.455556, 0.455556, 0.356473); // 偏灰色 —— 云组成部分1
  vec3 color3 = vec3(0, 0, 0.164706); // 深蓝色 —— 云组成部分2 —— 天空映射
  vec3 color4 = vec3(0.666667, 1., 1.); // 偏天蓝色 —— 总体减少红色部分

  color = mix(color1, color2, clamp((f * f) * 4.0, 0.0, 1.0));

  float t = 2. / 24. * day_time - 1.2;
  if (t < -1.)
    t = 1. - (-1. - t);
  float move = .1;
  if (t < 0.)
    t = clamp(-1., 0., t - move);
  else
    t = clamp(0., 1., t);
  t = abs(t);

  vec3 sky_color = getSkyColor(day_time);

  color = mix(color, sky_color * 0.5, clamp(length(q), 0.0, 1.0));

  color = mix(color, color4, clamp(length(r.x), 0.0, 1.0));

  color = mix(color, sky_color, smoothstep(0., 1., slow(t, 0.624)));

  gl_FragColor = vec4(color, 1.);
}