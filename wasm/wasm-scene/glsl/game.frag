precision mediump float;

uniform vec3 iResolution;
uniform float iTime;

uniform vec3 ro;
uniform vec3 ta;
uniform mat3 camMat;
uniform float sita;
//------------------------------------------------------------------------
// SDF sculpting
//
// Thsi is the SDF function F that defines the shapes, in this case a sphere
// of radius 1. More info: https://iquilezles.org/articles/distfunctions/
//------------------------------------------------------------------------

float tree_radius = 1.;
float scale = 100.;

float random(float p) {
  p = fract(p * 0.011);
  p *= p + 7.5;
  p *= p + p;
  return fract(p);
}

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

float noise(vec3 x) {
  const vec3 step = vec3(110, 241, 171);

  vec3 i = floor(x);
  vec3 f = fract(x);

  // For performance, compute the base input to a 1D hash from the integer part
  // of the argument and the incremental change to the 1D based on the 3D -> 1D
  // wrapping
  float n = dot(i, step);

  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(random(n + dot(step, vec3(0, 0, 0))),
                     random(n + dot(step, vec3(1, 0, 0))), u.x),
                 mix(random(n + dot(step, vec3(0, 1, 0))),
                     random(n + dot(step, vec3(1, 1, 0))), u.x),
                 u.y),
             mix(mix(random(n + dot(step, vec3(0, 0, 1))),
                     random(n + dot(step, vec3(1, 0, 1))), u.x),
                 mix(random(n + dot(step, vec3(0, 1, 1))),
                     random(n + dot(step, vec3(1, 1, 1))), u.x),
                 u.y),
             u.z);
}

#define OCTAVES 20
float fbm(in vec2 st) {
  // Initial values
  float value = 0.0;
  float amplitude = .5;
  float frequency = 0.;
  //
  // Loop of octaves
  for (int i = 0; i < OCTAVES; i++) {
    if (i >= 7 && i <= 13)
      continue;
    else {
      value += amplitude * noise(st);
      st *= 2.;
      amplitude *= .5;
    }
  }
  return value;
}

float fbm(vec3 x) {
  float v = 0.0;
  float a = 0.5;
  vec3 shift = vec3(100.);
  for (int i = 0; i < OCTAVES; ++i) {
    v += a * noise(x);
    x = x * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

float calModelGround(in vec2 p) {
  float fbm_num = fbm(p);
  fbm_num += 1.;
  return fbm_num;
}

float doModelGround(vec3 p) {
  float h = calModelGround(p.xz);

  float ground = p.y - h;
  return ground;
}

void calModelTree(in vec3 pos, out vec3 r, out vec3 w) {
  vec2 st = pos.xz;
  st = st * scale;
  st = floor(st / tree_radius / 2.);
  // st = (st * 2. + 1.) * tree_radius;

  float n = 107. * st.x + 113. * st.y + 131.;

  st = (st * 2. + .5 + fract(n * fract(n / vec2(3.14, 2.71)))) * tree_radius;
  n += 77648.;

  vec2 lamda = fract(n * fract((n + vec2(0., 1.)) / 3.14));

  float nHeight = .01 * smoothstep(0., 1., fbm(st.xy));

  vec2 tree_pos_cen = st / scale; // tree_radius * tree_pos + tree_radius / 2.;
  float tree_ground = calModelGround(tree_pos_cen);

  float tree_height = tree_radius / scale / 2. + nHeight;
  r = tree_height * .7 *
      (vec3(1., 1.5, 1.) + lamda.x * vec3(.4, .5, .4) +
       lamda.y * vec3(.6, 0., .6));
  float lamda5 = smoothstep(0., 0.1, fbm(st));
  r.x = r.x * (.5 + lamda5 * .5);
  r.y = r.y * (1.6 - lamda5 * .3);
  r.z = r.z * (.5 + lamda5 * .5);

  vec3 tree_center = vec3(tree_pos_cen.x, tree_ground + r.y, tree_pos_cen.y);

  w = pos - tree_center;
}

float doModelTree(vec3 p) {
  vec3 r, w;
  calModelTree(p, r, w);

  float len = length(w / r);

  float tree = (len * len - len) / (length(w / r / r)) +
               fbm(p * 600.) * fbm(p * 600.) * 0.01;

  return tree;
}

float doModelClouds(vec3 p) {
  vec3 posInFact = p + iTime / 40.;
  float clouds_height = 4.;
  float clouds = abs(p.y - clouds_height) - 2. * (.4 - fbm(posInFact));
  return clouds;
}

vec3 rgbNormalize(in vec3 color) { return color / 255.0; }

vec3 doLighting(in vec3 pos, in vec3 nor, in vec3 rd, in float dis, in vec3 mal,
                in float lamda2, in int index, in vec3 lig) {
  vec3 lin = vec3(0.0);

  float dif = max(dot(nor, lig), 0.0);
  lin += dif;

  // shadow
  float t = .1;
  vec3 delta = lig * t + pos;
  // float tHeight = fbm(pos.xz);
  float r = smoothstep(0., 1.,
                       doModelGround(delta) /
                           t); // min(doModelGround(delta), doModelTree(delta)）

  lin *= r;

  // float lamda_t = 2. - smoothstep(0., 100., t);
  // lin *= lamda_t;

  float dif2 = max(0., dot(nor, -lig));

  vec3 col = (mal * lin +
              (1. + nor.y) / 2. * rgbNormalize(vec3(145., 211., 243.)) / 10. +
              dif2 * rgbNormalize(vec3(232., 175., 127.)) / 10.) *
             lamda2;
  if (index == 1) {
    vec3 v = -rd;
    float dif3 = max(0., dot(nor, v));
    col += pow(dif3, 5.) * rgbNormalize(vec3(238., 231., 159.)) / 20. * lamda2;
  }

  // fog
  //-----------------------------
  vec3 lamda = exp(-0.1 * dis * vec3(1., 2., 4.));
  col = col * lamda + (1. - lamda) * rgbNormalize(vec3(196, 196, 196.));

  float fr = pow(1. - sqrt((1. + max(0., dot(lig, -rd))) / 2.), 5.);
  vec3 r2 = 2. * nor * max(0., dot(nor, lig)) - lig;
  col += pow(max(0., dot(r2, -rd)), 9.) * (.05 + .95 * fr) *
         max(0., dot(nor, lig));
  return col;
}

void doCamera(out vec3 camPos, out vec3 camTar, in float time) {
  vec2 tarPoint = vec2(10., -0.1);
  float height = fbm(tarPoint);
  // camTar = vec3(tarPoint.x, 0., tarPoint.y); // 目标位置保持不变
  camTar = vec3(tarPoint.x, calModelGround(tarPoint),
                tarPoint.y); // 目标位置保持不变

  float an = 0.5;    // 让摄像机随时间旋转
  float radius = 1.; // 摄像机到目标的水平距离
  vec2 camPoint = tarPoint + vec2(radius * cos(an), radius * sin(an));
  // camPos = vec3(camPoint.x, fbm(camPoint) + .3, camPoint.y); //
  // 调整摄像机位置
  camPos = vec3(camPoint.x, calModelGround(camPoint) + .1,
                camPoint.y); // 调整摄像机位置
  // camPos = vec3(tarPoint.x, .5, tarPoint.y); // 调整摄像机位置
}

//=============================================================

// more info: https://iquilezles.org/articles/normalsSDF/
vec3 compute_normal_ground(in vec3 pos) {
  const float eps = 0.002; // precision of the normal computation
  const vec3 v1 = vec3(1.0, -1.0, -1.0);
  const vec3 v2 = vec3(-1.0, -1.0, 1.0);
  const vec3 v3 = vec3(-1.0, 1.0, -1.0);
  const vec3 v4 = vec3(1.0, 1.0, 1.0);
  return normalize(
      v1 * doModelGround(pos + v1 * eps) + v2 * doModelGround(pos + v2 * eps) +
      v3 * doModelGround(pos + v3 * eps) + v4 * doModelGround(pos + v4 * eps));
}
vec3 compute_normal_tree(in vec3 pos) {
  const float eps = 0.002; // precision of the normal computation
  const vec3 v1 = vec3(1.0, -1.0, -1.0);
  const vec3 v2 = vec3(-1.0, -1.0, 1.0);
  const vec3 v3 = vec3(-1.0, 1.0, -1.0);
  const vec3 v4 = vec3(1.0, 1.0, 1.0);
  return normalize(
      v1 * doModelTree(pos + v1 * eps) + v2 * doModelTree(pos + v2 * eps) +
      v3 * doModelTree(pos + v3 * eps) + v4 * doModelTree(pos + v4 * eps));
}

float intersect(in vec3 ro, in vec3 rd, out int index) {
  // return -1.0;
  const float maxd = 100.0;
  float t = 0.0;
  index = -1;
  for (int i = 0; i < 128; i++) // max number of raymarching iterations is 90
  {
    vec3 p = ro + rd * t;
    float dGround = doModelGround(p);
    float dTree = doModelTree(p);
    float dClouds = doModelClouds(p);
    float d = min(min(dTree, dGround), dClouds);
    if (d < 0.001 || t > maxd) {
      if (dClouds < dGround && dClouds < dTree) {
        index = 2;
        // t = maxd;
      } else if (dGround < dTree) {
        index = 0;
      } else if (dTree < dGround) {
        index = 1;
      }
      break; // precision 0.001, maximum distance 20
    }
    t += d;
  }
  if (index == -1)
    return -1.0;
  return (t < maxd) ? t : -1.0;
}

float cloudThiknessOnSunRay(in vec3 lig, in vec3 pos) {
  float thickness = 0.;
  const int maxIter = 40;
  float per_step = 0.01;
  int front = 0;
  int back = 0;
  for (int i = 0; i < maxIter; i++) {
    if (front != -1) {
      float dFront = doModelClouds(pos + lig * float(i) * per_step);
      if (dFront > 0.001) {
        thickness += dFront;
        front = -1;
      }
    }
    if (back != -1) {
      float dBack = doModelClouds(pos - lig * float(i) * per_step);
      if (dBack > 0.001) {
        thickness += dBack;
        back = -1;
      }
    }
    if (front == -1 && back == -1) {
      break;
    }
  }
  return smoothstep(0., float(maxIter) * 2., thickness);
}

vec3 filter(in vec3 col, in vec3 rd, in vec3 lig) {
  col = pow(col, vec3(1., .9, 1.)) + rgbNormalize(vec3(0., 0., 254.)) / 8.;
  col +=
      pow(max(0., dot(rd, lig)), 1.) * rgbNormalize(vec3(255., 175., 79.)) / 2.;
  return col;
}

vec3 color(in vec2 uv) {
  // camera movement (ro is ray origin, ta is the target location we are looking
  // at)
  /* vec3 ro, ta;
  doCamera(ro, ta, 0.);

  // camera matrix
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));
  mat3 camMat = mat3(uu, vv, ww); */

  // create ray
  vec3 rd = normalize(camMat * vec3(uv, 2.0)); // 2.0 is the lens length
  // project/intersect through raymarching of SDFs
  int index;
  float t = intersect(ro, rd, index);

  // geometry
  vec3 pos = ro + t * rd;
  // pos = ro + 100. * rd;
  /* if (index == 2) {
    pos = ro + -1. * rd;
  } */

  // key light
  //-----------------------------
  // float sita = -1.;
  float fai = 2.;
  vec3 lig =
      vec3(sin(sita) * sin(fai), cos(sita), sin(sita) * cos(fai)); // nor_len;

  // compute sky
  float lamda = smoothstep(0.2, 1., fbm(pos.xy * 10.)) * .6;
  vec3 col = rgbNormalize(vec3(175., 212., 255.)) - .4 * (2. - pos.y);
  col = col * (1. - lamda) + lamda;
  // return vec3(float(index) / 3.);
  // return camMat.x + camMat.y + camMat.z;
  // return vec3(camMat[0][0]);
  if (t > -0.5) {
    vec3 nor;

    // materials
    float lamda1;
    vec3 mal;

    if (index == 2) {

      float lamda_c = cloudThiknessOnSunRay(lig, pos) *
                      10.; // vec3(1.); //* smoothstep(.2, .3,
      // fbm(pos * 10.)); //.8 + fbm(pos) *

      // lig * .2;
      vec3 lamda2 = exp(-0.03 * t * vec3(1., 2., 4.));
      col =
          lamda2 * col +
          (1. - lamda2) * rgbNormalize(vec3(196., 196., 196.)); // clouds color

      vec3 sky_pos = ro + -1. * rd;
      float lamda = smoothstep(0.2, 1., fbm(sky_pos.xy * 10.)) * .6;
      vec3 sky = rgbNormalize(vec3(175., 212., 255.)) - .4 * (2. - sky_pos.y);
      sky = sky * (1. - lamda) + lamda;

      // sky = smoothstep(0.0, 1.0, sky);

      col = lamda_c * col + (1. - lamda_c) * sky; // fix cloud color && sky
      col = smoothstep(0.0, 1.0, col);
      // col = doLighting(pos, nor, rd, t, col, 0., index, lig);
      // col = vec3(.9);
      return col;
      /*
            col = vec3(1.);
            // lamda_c = 0.;
            // lig * .2;
            // col = lamda_c * vec3(1.) + (1. - lamda_c) * col;
            vec3 lamda2 = exp(-0.03 * t * vec3(1., 2., 4.));
            col = lamda2 * col + (1. - lamda2) * rgbNormalize(vec3(196., 196.,
         196.)); return col;

            vec3 sky = doLighting(pos, nor, rd, t, mal, 0., index, lig);

            col = lamda_c * col + (1. - lamda_c) * sky;

            col = smoothstep(0.0, 1.0, col);
            return filter(col, rd, lig); */
    } else {
      float lamda2;
      if (index == 0) {
        nor = compute_normal_ground(pos);
        lamda1 = smoothstep(0.7, 0.9, nor.y);
        mal = rgbNormalize(vec3(228.0, 172.0, 155.0)) * (1.0 - lamda1) +
              rgbNormalize(vec3(130.0, 130.0, 9.0)) * lamda1;
        lamda2 = smoothstep(.5, .6, pos.y) * 0.8 + 0.2;
      } else if (index == 1) {
        nor = normalize(compute_normal_tree(pos) * 2. +
                        compute_normal_ground(pos));
        lamda1 = smoothstep(0.7, 0.9, nor.y);
        mal = rgbNormalize(vec3(158., 162., 70.)) * (1. - lamda1) +
              lamda1 * rgbNormalize(vec3(130.0, 130.0, 9.0));
        vec2 m = floor(pos.xz * scale / tree_radius / 2.);
        vec2 n = fract(m / 3.14) * 50.;
        float lamda3 = smoothstep(0.2, 0.9, fract(n.x * n.y * (n.x + n.y)));
        float lamda4 = smoothstep(0.1, 0.3, fbm(pos.xz));
        mal =
            mal * (1. - lamda3) + lamda3 * rgbNormalize(vec3(243., 224., 64.));
        mal =
            mal * (1. - lamda4) + lamda4 * rgbNormalize(vec3(244., 192., 83.));
        /* float lamda5 = smoothstep(.7, .8, pos.y);
        mal *= 1. - lamda5 / 2.; */

        vec3 r, w;
        calModelTree(pos, r, w);
        lamda2 = (r.y + w.y) / (r.y * 2.);
      }
      // lighting
      col = doLighting(pos, nor, rd, t, mal, lamda2, index, lig);
    }
  }

  col = smoothstep(0.0, 1.0, col);

  return filter(col, rd, lig);
}

void main() {

  vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
  uv = gl_FragCoord.xy / iResolution.xy;
  uv = uv * 2. - 1.;

  gl_FragColor = vec4(vec3(uv.x + uv.y), 1.0);
  // return;

  vec3 col = color(uv);
  gl_FragColor = vec4(col, 1.);
  return;
  uv = gl_FragCoord.xy / iResolution.xy;
  col = col * pow(16. * uv.x * (1. - uv.x) * uv.y * (1. - uv.y), 1. / 20.);
  gl_FragColor = vec4(col, 1.);
}