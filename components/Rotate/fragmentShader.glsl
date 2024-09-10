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

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {

  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                      -0.577350269189626,
                      0.024390243902439);

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = vec2(0.0);
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0.xy + C.xx - i1;
  vec2 x2 = x0.xy + C.zz;

  i = mod289(i);
  vec3 p =
      permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);

  m = m * m;
  m = m * m;


  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g = vec3(0.0);
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
  return 130.0 * dot(m, g);
}

#define OCTAVES 3
float turbulence(in vec2 st) {
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
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

float noise(in vec2 _st) {
  vec2 i = floor(_st);
  vec2 f = fract(_st);

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
  // st.x *= u_resolution.x / u_resolution.y;
  // st.x += (1. - u_resolution.x / u_resolution.y) / 2.;

  float time = u_time;

  float len = abs(length(vec2(.5) - st));

  float theta = atan(st.y - .5, st.x - .5);
  theta = mod(theta + 2. * PI + time * (mod(len, 2.) - 1.), 2. * PI);

  len = len * time ;

  st = vec2(.5) + len * vec2(cos(theta), sin(theta));

  float color = fbm(fbm(fbm(st) + st) + st);

  gl_FragColor = vec4(vec3(color), 1.);
}