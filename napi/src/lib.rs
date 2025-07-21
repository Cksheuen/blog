#![deny(clippy::all)]

use napi_derive::napi;

pub mod sdf;
pub mod utils;

use rayon::prelude::*;

#[napi]
pub struct Generator {}

#[napi]
impl Generator {
  #[napi(constructor)]
  pub fn new(height: u32, width: u32) -> Self {
    let pixel_count = height * width;

    let init_data = utils::init_data(utils::Vec2::new(100.0, 0.1));

    let cam_mat = &init_data.cam_mat;
    let ro = &init_data.ro;

    let data_in_parallel = {
      let mut data_in_parallel = vec![0.0; (pixel_count * 4) as usize];
      data_in_parallel
        .par_chunks_mut(width as usize * 4)
        .enumerate()
        .for_each(|(i, chunk)| {
          for j in 0..width {
            let uv = utils::Vec2::new((i as f64) / height as f64, (j as f64) / width as f64);
            let result = utils::cal_pos_relative(*cam_mat, uv, *ro);
            let index = j as usize * 4;
            chunk[index] = result.pos.x;
            chunk[index + 1] = result.pos.y;
            chunk[index + 2] = result.pos.z;
            chunk[index + 3] = result.t;
          }
        });
      data_in_parallel
    };

    Generator {}
  }
}
