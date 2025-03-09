extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

use js_sys::Math::sin;
use std::clone::Clone;
use std::fmt;
use std::ops::{Add, Div, Mul, Sub};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Clone, Copy)]
pub struct Vec2 {
    pub x: f64,
    pub y: f64,
}

impl Vec2 {
    pub fn new(x: f64, y: f64) -> Vec2 {
        Vec2 { x, y }
    }
    pub fn single_new(x: f64) -> Vec2 {
        Vec2 { x, y: x }
    }
}

impl Add for Vec2 {
    type Output = Vec2;

    fn add(self, other: Vec2) -> Vec2 {
        Vec2 {
            x: self.x + other.x,
            y: self.y + other.y,
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
fn fbm(st: Vec2) -> f64 {
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
}

impl fmt::Display for Vec3 {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Vec3({}, {}, {})", self.x, self.y, self.z)
    }
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

#[derive(Clone, Copy)]
pub struct Mat3 {
    pub mat: [Vec3; 3],
}

impl Mat3 {
    pub fn to_array(self) -> [f32; 9] {
        [
            self.mat[0].x as f32,
            self.mat[0].y as f32,
            self.mat[0].z as f32,
            self.mat[1].x as f32,
            self.mat[1].y as f32,
            self.mat[1].z as f32,
            self.mat[2].x as f32,
            self.mat[2].y as f32,
            self.mat[2].z as f32,
        ]
    }
}

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

pub fn init_data(tar_point: Vec2) -> InitDataResult {
    let DoCameraResult {
        cam_pos: ro,
        cam_tar: ta,
    } = do_camera(tar_point);

    let ww = (ta - ro).normalize();
    let uu = ww.cross(Vec3::new(0.0, 1.0, 0.0)).normalize();
    let vv = uu.cross(ww).normalize();
    let cam_mat = Mat3 { mat: [uu, vv, ww] };

    InitDataResult { cam_mat, ro, ta }
}
