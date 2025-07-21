use std::clone::Clone;
use std::fmt;
use std::cmp::min;
use std::ops::{Add, Div, Mul, Sub};

#[napi]
#[derive(Clone, Copy)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

#[napi]
impl Vec2 {
    #[napi(constructor)]
    pub fn new(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }
    pub fn single_new(x: f64) -> Vec2 {
        Vec2 { x, y: x }
    }
}

impl Add<Vec2> for Vec2 {
    type Output = Vec2;

    fn add(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
}

impl Add<f64> for Vec2 {
    type Output = Vec2;

    fn add(self, other: f64) -> Vec2 {
        Vec2 {
            x: self.x + other,
            y: self.y + other,
        }
    }
}

impl Sub for Vec2 {
    type Output = Vec2;

    fn sub(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
}

impl Sub<f64> for Vec2 {
    type Output = Vec2;

    fn sub(self, other: f64) -> Vec2 {
        Vec2 {
            x: self.x - other,
            y: self.y - other,
        }
    }
}

impl Sub<Vec2> for f64 {
    type Output = Vec2;

    fn sub(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self - other.x,
            y: self - other.y,
        }
    }
}

impl Mul<Vec2> for Vec2 {
    type Output = Vec2;

    fn mul(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x * other.x,
            y: self.y * other.y,
        }
    }
}

impl Mul<f64> for Vec2 {
    type Output = Vec2;

    fn mul(self, other: f64) -> Vec2 {
        Vec2 {
            x: self.x * other,
            y: self.y * other,
        }
    }
}

impl Div<f64> for Vec2 {
    type Output = Vec2;

    fn div(self, other: f64) -> Vec2 {
        Vec2 {
            x: self.x / other,
            y: self.y / other,
        }
    }
}

impl Vec2 {
    pub fn dot(self, other: Vec2) -> f64 {
        self.x * other.x + self.y * other.y
    }

    pub fn cross(self, other: Vec2) -> f64 {
        self.x * other.y - self.y * other.x
    }

    pub fn length(self) -> f64 {
        (self.x * self.x + self.y * self.y).sqrt()
    }

    pub fn normalize(self) -> Vec2 {
        let length = self.length();
        Vec2 {
            x: self.x / length,
            y: self.y / length,
        }
    }
    pub fn fract(self) -> Vec2 {
        Vec2 {
            x: self.x.fract(),
            y: self.y.fract(),
        }
    }
    pub fn floor(self) -> Vec2 {
        Vec2 {
            x: self.x.floor(),
            y: self.y.floor(),
        }
    }
    pub fn to_array(self) -> [f32; 2] {
        [self.x as f32, self.y as f32]
    }
}

fn random(st: Vec2) -> f64 {
    (sin(st.dot(Vec2::new(12.9898, 78.233))) * 43758.5453).fract()
}

fn mix(a: f64, b: f64, t: f64) -> f64 {
    a * (1.0 - t) + b * t
}

fn noise(st: Vec2) -> f64 {
    let i = st.floor();
    let f = st.fract();

    let a = random(i);
    let b = random(i + Vec2::new(1.0, 0.0));
    let c = random(i + Vec2::new(0.0, 1.0));
    let d = random(i + Vec2::new(1.0, 1.0));

    let u = f * f * (3.0 - f * 2.0);

    mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y
}

const OCTAVES: i32 = 20;
pub fn fbm(st: Vec2) -> f64 {
    let mut value = 0.0;
    let mut amplitude = 0.5;
    let mut frequency = 0.0;
    for i in 0..OCTAVES {
        if i >= 7 && i <= 13 {
            continue;
        }
        value += amplitude * noise(st);
        amplitude *= 0.5;
    }
    value
}

#[napi]
#[derive(Clone, Copy)]
pub struct Vec3 {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

impl Vec3 {
    pub fn new(x: f64, y: f64, z: f64) -> Vec3 {
        Vec3 { x, y, z }
    }
}

impl Add for Vec3 {
    type Output = Vec3;

    fn add(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.x + other.x,
            y: self.y + other.y,
            z: self.z + other.z,
        }
    }
}

impl Sub for Vec3 {
    type Output = Vec3;

    fn sub(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.x - other.x,
            y: self.y - other.y,
            z: self.z - other.z,
        }
    }
}

impl Mul<Vec3> for Vec3 {
    type Output = Vec3;

    fn mul(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.x * other.x,
            y: self.y * other.y,
            z: self.z * other.z,
        }
    }
}

impl Mul<f64> for Vec3 {
    type Output = Vec3;

    fn mul(self, other: f64) -> Vec3 {
        Vec3 {
            x: self.x * other,
            y: self.y * other,
            z: self.z * other,
        }
    }
}

impl Mul<i32> for Vec3 {
    type Output = Vec3;

    fn mul(self, other: i32) -> Vec3 {
        Vec3 {
            x: self.x * other as f64,
            y: self.y * other as f64,
            z: self.z * other as f64,
        }
    }
}

impl Vec3 {
    pub fn dot(self, other: Vec3) -> f64 {
        self.x * other.x + self.y * other.y + self.z * other.z
    }

    pub fn cross(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.y * other.z - self.z * other.y,
            y: self.z * other.x - self.x * other.z,
            z: self.x * other.y - self.y * other.x,
        }
    }

    pub fn length(self) -> f64 {
        (self.x * self.x + self.y * self.y + self.z * self.z).sqrt()
    }

    pub fn normalize(self) -> Vec3 {
        let length = self.length();
        Vec3 {
            x: self.x / length,
            y: self.y / length,
            z: self.z / length,
        }
    }
    pub fn to_array(self) -> [f32; 3] {
        [self.x as f32, self.y as f32, self.z as f32]
    }
    pub fn fract(self) -> Vec3 {
        Vec3 {
            x: self.x.fract(),
            y: self.y.fract(),
            z: self.z.fract(),
        }
    }
    pub fn floor(self) -> Vec3 {
        Vec3 {
            x: self.x.floor(),
            y: self.y.floor(),
            z: self.z.floor(),
        }
    }
}

impl fmt::Display for Vec3 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Vec3({}, {}, {})", self.x, self.y, self.z)
    }
}

impl Div<Vec3> for Vec3 {
    type Output = Vec3;
    fn div(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.x / other.x,
            y: self.y / other.y,
            z: self.z / other.z
        }
    }
}


fn random_f(p: f64) -> f64 {
    /* p = fract(p * 0.011);
    p *= p + 7.5;
    p *= p + p;
    return fract(p); */
    let mut p = p * 0.011;
    p = p.fract();
    p = p * (p + 7.5);
    p = p * (p + p);
    p.fract()
  }

fn noise_vec3(x: Vec3) -> f64 {
    let step: Vec3 = Vec3::new(110.0, 241.0, 171.0);
  
    let i = x.floor();
    let f = x.fract();
  
    // For performance, compute the base input to a 1D hash from the integer part
    // of the argument and the incremental change to the 1D based on the 3D -> 1D
    // wrapping
    let n = i.dot(step);
  
    let u = f * f * (Vec3::new(3.0, 3.0, 3.0) - f * 2.0);
    return mix(mix(mix(random_f(Vec3::new(0.0, 0.0, 0.0).dot(step) + n),
                       random_f(Vec3::new(1.0, 0.0, 0.0).dot(step) + n), u.x),
                    mix(random_f(Vec3::new(0.0, 1.0, 0.0).dot(step) + n),
                       random_f(Vec3::new(1.0, 1.0, 0.0).dot(step) + n), u.x),
                   u.y),
               mix(mix(random_f(Vec3::new(0.0, 0.0, 1.0).dot(step) + n),
                    random_f(Vec3::new(1.0, 0.0, 1.0).dot(step) + n), u.x),
                    mix(random_f(Vec3::new(0.0, 1.0, 1.0).dot(step) + n),
                    random_f(Vec3::new(1.0, 1.0, 1.0).dot(step) + n), u.x),
                   u.y),
               u.z);
  }

pub fn fbm_vec3(mut x: Vec3) -> f64 {
    let mut v = 0.0;
    let mut a = 0.5;
    let shift = Vec3::new(100.,100.,100.);
    for i in [0..OCTAVES] {
        v += a * noise_vec3(x);
        x = x * 2.0 + shift;
        a *= 0.5;
    }
    v
}

fn cal_model_ground(p: Vec2) -> f64 {
    let mut fbm_num = fbm(p);
    fbm_num += 1.0;
    fbm_num
}

struct DoCameraResult {
    pub cam_pos: Vec3,
    pub cam_tar: Vec3,
}

fn do_camera(tar_point: Vec2) -> DoCameraResult {
    let height: f64 = 1.5;
    let cam_tar = Vec3::new(tar_point.x, height, tar_point.y);

    let an: f64 = 0.5;
    let radius: f64 = 1.0;
    let cam_height: f64 = 1.8;
    let cam_point = tar_point + Vec2::new(radius * an.cos(), radius * an.sin());
    let cam_pos = Vec3::new(cam_point.x, cam_height, cam_point.y);

    DoCameraResult { cam_pos, cam_tar }
}

#[napi]
#[derive(Clone, Copy)]
pub struct Mat3 {
    pub col1: Vec3,
    pub col2: Vec3,
    pub col3: Vec3,
}

impl Mat3 {
    pub fn to_array(self) -> [f32; 9] {
        [
            self.col1.x as f32, self.col1.y as f32, self.col1.z as f32,
            self.col2.x as f32, self.col2.y as f32, self.col2.z as f32,
            self.col3.x as f32, self.col3.y as f32, self.col3.z as f32,
        ]
    }
}

impl Mul<Vec3> for Mat3 {
    type Output = Vec3;
    fn mul(self, other: Vec3) -> Vec3 {
        Vec3 {
            x: self.col1.x * other.x + self.col2.x * other.y + self.col3.x * other.z,
            y: self.col1.y * other.x + self.col2.y * other.y + self.col3.y * other.z,
            z: self.col1.z * other.x + self.col2.z * other.y + self.col3.z * other.z,
        }
    }
}

pub fn smoothstep(edge0: f64, edge1: f64, x: f64) -> f64 {
    // 首先将 x 限制在 [0,1] 范围内
    let t = ((x - edge0) / (edge1 - edge0)).clamp(0.0, 1.0);
    // 执行 Hermite 插值: 3t² - 2t³
    t * t * (3.0 - 2.0 * t)
}

#[napi]
pub struct InitDataResult {
    pub cam_mat: Mat3,
    pub ro: Vec3,
    pub ta: Vec3,
}

impl fmt::Display for InitDataResult {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "cam_mat: {:?}", self.cam_mat.to_array())
    }
}

#[napi]
pub fn init_data(tar_point: Vec2) -> InitDataResult {
    let DoCameraResult {
        cam_pos: ro,
        cam_tar: ta,
    } = do_camera(tar_point);

    let ww = (ta - ro).normalize();
    let uu = ww.cross(Vec3::new(0.0, 1.0, 0.0)).normalize();
    let vv = uu.cross(ww).normalize();
    let cam_mat = Mat3 { 
        col1: uu,
        col2: vv,
        col3: ww,
     };

    InitDataResult { cam_mat, ro, ta }
}

/*  pos(vec3) && t(float) && rd(vec3)
    from 
    camMat uv(vec2) && ro(vec3)
*/

use crate::sdf;


pub fn intersect(ro: Vec3, rd: Vec3) -> (f64, i32) {
    const MAXD: f64 = 100.0;
    let mut t = 0.0;
    let mut index = -1;

    for i in 0..128  {
        let p = ro + rd * t;
        
        let d_ground = sdf::do_model_ground(p.clone());
        let d_tree = sdf::do_model_tree(p.clone());
        let d = d_ground.min(d_tree);
        
        if d < 0.001 || t > MAXD {
            if d_ground < d_tree {
                index = 0;
            } else {
                index = 1;
            }
            break;
        }
        t += d;
    }
    if index == -1 || t >= MAXD {
        t = -1.0;
    }
    (t, index)
}

#[napi]
pub struct PosRelativeResult {
    pub pos: Vec3,
    pub t: f64,
    pub rd: Vec3,
}

#[napi]
pub fn cal_pos_relative(cam_mat: Mat3, uv: Vec2, ro: Vec3) -> PosRelativeResult {
    let rd = (cam_mat * Vec3::new(uv.x, uv.y, 2.0)).normalize();
    let (t, index) =intersect(ro, rd);
    let pos = ro + rd * t;
    PosRelativeResult { pos, t, rd }
}


/*  lig(vec3)
    from
    sita(float) && fai(float)
*/
