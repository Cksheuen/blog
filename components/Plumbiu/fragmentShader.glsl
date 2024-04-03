#define PI 3.14159265359
#define BRANCHES_NUM 300
#define TIME_PARAMS 100

uniform float u_ratio;
uniform vec2 u_cursor;
uniform float u_stop_time;
uniform float u_clean;
uniform vec2 u_stop_randomizer;
uniform float u_time;

uniform sampler2D u_texture;
varying vec2 vUv;

uniform vec4 u_branches[300];
uniform float u_before_lens[300];

float random(in vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm(in vec2 st) {
  // Initial values
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
  //
  // Loop of octaves
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * noise(st);
    st *= 2.;
    amplitude *= .5;
  }
  return value;
}

// --------------------------------
// 2D noise

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626,
                      0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  // x0 = v + dot(i, c.xx) - floor(v + dot(v, c.yy));
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p =
      permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(
      0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/*
_p 花瓣坐标
_pet_n 花瓣数量
_angle 角度
_outline
*/
float get_flower_shape(vec2 _p, float _pet_n, float _angle, float _outline) {
  // 扩大角度
  _angle *= 3.;

  // 旋转_angle
  _p = vec2(_p.x * cos(_angle) - _p.y * sin(_angle),
            _p.x * sin(_angle) + _p.y * cos(_angle));

  // 获取角度
  float a = atan(_p.y, _p.x);
  /*
  a * _pet_n 总角度
  sin()
  */
  float flower_sectoral_shape = pow(abs(sin(a * _pet_n)), .4) + .25;

  // 随机size 花瓣此处半径的大小？
  vec2 flower_size_range = vec2(.03, .1) * 0.2;
  float size =
      flower_size_range[0] + u_stop_randomizer[0] * flower_size_range[1];

  // 当前像素与花朵中心距离与花瓣半径大小的比值
  // 非线性
  float flower_radial_shape = pow(length(_p) / size, 2.);
  flower_radial_shape -= .1 * sin(8. * a); // add noise
  // 径向不小于0.1
  flower_radial_shape = max(.1, flower_radial_shape);
  // 左右对齐， 上方r较小
  /*
  abs(_p.y) * abs(_p.x) 各方向对称
  */
  flower_radial_shape += smoothstep(0., 0.03, -.3 * _p.y + .2 * abs(_p.x));

  // stop时间前为0
  float grow_time = step(.25, u_stop_time) * pow(u_stop_time, .3);
  // grow_time ++
  // flower_radial_shape --
  // flower_shape ++
  float flower_shape =
      1. - smoothstep(0., flower_sectoral_shape,
                      _outline * flower_radial_shape / grow_time);
  // 延时开花
  flower_shape *= (1. - step(1., grow_time));

  return flower_shape;
}

/*
_p 花坐标
_uv 当前坐标
_w 花茎宽度
_angle 角度
*/

float get_stem_shape(vec2 _p, vec2 _uv, float _w, float _angle) {

  // 设置最小宽度.004
  _w = max(.004, _w);

  float x_offset = _p.y * sin(_angle);
  x_offset *= pow(3. * _uv.y, 2.);
  _p.x -= x_offset;

  // add horizontal noise to the cursor coordinale
  float noise_power = .5;
  float cursor_horizontal_noise =
      noise_power * snoise(2. * _uv * u_stop_randomizer[0]);
  cursor_horizontal_noise *=
      pow(dot(_p.y, _p.y), .6); // moise to be zero at cursor
  cursor_horizontal_noise *=
      pow(dot(_uv.y, _uv.y), .3); // moise to be zero at bottom
  _p.x += cursor_horizontal_noise;

  // vertical line through the cursor point (_p.x)
  float left = smoothstep(-_w, 0., _p.x);
  float right = 1. - smoothstep(0., _w, _p.x);
  float stem_shape = left * right;

  // // make it grow + don't go up to the cursor point
  // float grow_time =
  //     1. - smoothstep(0., .2, u_stop_time); // decrease as time going by
  /*
          time++
          grow_time--
          stem_top_mask++
          _p.y++
          stem_top_mask--
  //         */
  // float stem_top_mask = smoothstep(0., pow(grow_time, .5), .03 - _p.y);
  // stem_shape *= stem_top_mask;

  // // stop drawing once done
  // stem_shape *= (1. - step(.17, u_stop_time));

  return stem_shape;
}

float dis(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float get_branch_shape(vec2 uv, float w) {
  w = max(.001, w);
  float d = 100.;
  float percent = 0.;
  float time = 0.;
  float preLen = 0.;

  // vec2 noiseP = fbm(vec2(sin(u_time / 10.), cos(u_time / 10.)));
  /* vec2 n = vec2(fbm(vec2(sin(u_time / 10.), cos(u_time / 10.))),
                fbm(vec2(cos(u_time / 10.), sin(u_time / 10.)))) *
           .05; */
  // float limitime = pow(fbm(uv + cos(u_time / 10.)), .5);
  for (int i = 0; i < BRANCHES_NUM; i++) {
    vec2 a = u_branches[i].xy;
    vec2 b = u_branches[i].zw;

    /* float noiseA = noise(a + u_time / 10.);
    float noiseB = noise(b + u_time / 10.);
    a += vec2(noiseA, noiseA) * 0.01; // 0.01是噪声强度，你可以根据需要调整
    b += vec2(noiseB, noiseB) * 0.01; */
    float nowD = dis(uv, a, b);
    if (nowD < d) {
      d = nowD;
      float per = sqrt(length(uv - a) * length(uv - a) - d * d);
      percent = smoothstep(0., 1.,
                           (per + u_before_lens[i]) /
                               (length(b - a) + u_before_lens[i]));
      time = (per + u_before_lens[i]) * 10.;
      preLen = per + u_before_lens[i];
    }
  }
  // w = smoothstep(.3, .5, 1. - percent);
  // w = w * pow((1. - percent + smoothstep(0., 10., min(u_time / 10., 1.))), 5.) *
  //     (1. - len / 2000.) * 10.;
  w = w * pow((1.1 - smoothstep(0., 1000., preLen)), 10.);
  float left = smoothstep(-w, 0., d);
  float right = 1. - smoothstep(0., w, d);
  float shape = left * right;

  float grow_time =
      1. - smoothstep(0., .2, u_time); // decrease as time going by
  /*
          time++
          grow_time--
          stem_top_mask++
          _p.y++
          stem_top_mask--
  //         */
  float branch_top_mask = smoothstep(0., pow(time, .5), u_time);
  shape *= branch_top_mask;

  // // stop drawing once done
  // stem_shape *= (1. - step(.17, u_stop_time));

  // shape *= 1. - mix(.1, 0., smoothstep(0., 1., pow(percent, .05)));
  // shape *= step(time, u_stop_time);
  // .5 * smoothstep(-w, 0., d) * (1. - smoothstep(0., w, d)) *
  //               (.5 - mix(.1, 0., smoothstep(0., 1., pow(percent, .05)))) *
  //               step(time, u_stop_time);
  return shape;
}

void main() {

  vec3 base = texture2D(u_texture, vUv).xyz;

  // 换算原点与鼠标点击坐标
  vec2 uv = vUv;
  uv.x *= u_ratio;
  // 点击处指向当前像素的向量
  vec2 cursor = vUv - u_cursor.xy;
  cursor.x *= u_ratio;

  // 柄颜色
  // vec3 stem_color = vec3(.1 + u_stop_randomizer[0] * .6, .6, .2);
  float stem_grayscale = pow(u_stop_randomizer[0], 2.) * .5 + .1;
  vec3 stem_color = vec3(stem_grayscale);

  //   vec3 flower_color = vec3(.6 + .5 * u_stop_randomizer[1], .1, .9 - .5 *
  //   u_stop_randomizer[1]);
  vec3 flower_color =
      vec3(.6 + .5 * u_stop_randomizer[1], .1, .3 - .1 * u_stop_randomizer[1]);
  /* float grayscale = u_stop_randomizer[1];
  vec3 flower_color = vec3(grayscale); */

  float angle = .5 * (u_stop_randomizer[0] - .5);

  float stem_shape = get_stem_shape(cursor, uv, .003, angle);
  stem_shape += get_stem_shape(
      cursor + vec2(0., .2 + .5 * u_stop_randomizer[0]), uv, .003, angle);
  float stem_mask = 1. - get_stem_shape(cursor, uv, .004, angle);
  stem_mask -= get_stem_shape(cursor + vec2(0., .2 + .5 * u_stop_randomizer[0]),
                              uv, .004, angle);

  float branch_shape = get_branch_shape(uv, .001);
  stem_shape +=
      get_branch_shape(uv + vec2(0., .2 + .5 * u_stop_randomizer[0]), .001);
  float branch_mask = 1. - get_branch_shape(uv, .002);
  branch_mask -=
      get_branch_shape(uv + vec2(0., .2 + .5 * u_stop_randomizer[0]), .002);

  // 后花瓣
  float petals_back_number = 1. + floor(u_stop_randomizer[0] * 2.);
  // 前后花瓣偏移量
  float angle_offset = -(2. * step(0., angle) - 1.) * .1 * u_stop_time;
  float flower_back_shape =
      get_flower_shape(cursor, petals_back_number, angle + angle_offset, 1.5);
  float flower_back_mask = 1. - get_flower_shape(cursor, petals_back_number,
                                                 angle + angle_offset, 1.6);

  // 前花瓣
  float petals_front_number = 2. + floor(u_stop_randomizer[1] * 2.);
  float flower_front_shape =
      get_flower_shape(cursor, petals_front_number, angle, 1.);
  float flower_front_mask =
      1. - get_flower_shape(cursor, petals_front_number, angle, .95);

  vec3 color = base;
  color *= branch_mask;
  // color *= stem_mask;
  color *= flower_back_mask;
  color *= flower_front_mask;

  // color += (stem_shape * stem_color);

  color +=
      (flower_back_shape * (flower_color + vec3(0., .8 * u_stop_time, 0.)));
  color += (flower_front_shape * flower_color);

  color += branch_shape * stem_color;

  color.r *= 1. - (.5 * flower_back_shape * flower_front_shape);
  color.b *= 1. - (flower_back_shape * flower_front_shape);

  // 花瓣延迟50ms
  color *= u_clean;

  float num = u_stop_randomizer[0] * u_stop_randomizer[1] * 10.;
  float final_gray;
  if (fract(num) > .5) {
    final_gray = color.y;
  } else {
    final_gray = color.z;
  }

  /* vec2 q = vec2(0.);
  q.x = fbm(uv + 0.00 * u_time);
  q.y = fbm(uv + vec2(1.0));

  vec2 r = vec2(0.);
  r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
  r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

  float f = fbm(uv + r);

  vec3 cloudColor =
      mix(vec3(0.101961, 0.619608, 0.666667),
          vec3(0.666667, 0.666667, 0.498039), clamp((f * f) * 4.0, 0.0, 1.0));

  cloudColor = mix(color, vec3(0, 0, 0.164706), clamp(length(q), 0.0, 1.0));

  cloudColor = mix(color, vec3(0.666667, 1, 1), clamp(length(r.x), 0.0, 1.0));

  gl_FragColor = vec4((f * f * f + .6 * f * f + .5 * f) * (color +
  cloudColor), 1.); */

  gl_FragColor = vec4(vec3(min(color.y, color.z)), 1.);
}
