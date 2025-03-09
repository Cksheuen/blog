pub extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate web_sys;

mod position;
use position::{Direction, Position, DIRECTIONS, STEP};

pub mod utils;

mod webgl;
use webgl::WebGL;

use std::cell::RefCell;
// use std::f64::INFINITY;
use std::rc::Rc;

use aes_gcm::aead::{generic_array::GenericArray, Aead, NewAead};
use aes_gcm::Aes256Gcm; // Or another AES variant
use base64;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(num: u32);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many_u32(a: u32, b: u32);
}

const KEY: &[u8; 32] = b"\x00\x0c\x00\x00\x00\x44\x00\x00\x00\x12\x00\x00\x00\x34\x00\x00\x00\x56\x00\x00\x00\x78\x00\x00\x00\x9a\x00\x00\x00\xbc\x00\x00";
const NONCE: &[u8; 12] = b"\x00\x0a\x00\x0b\x00\x0c\x00\x0d\x00\x0e\x00\x0f";

fn encrypt_glsl_code(glsl_code: &str) -> String {
    let cipher = Aes256Gcm::new(GenericArray::from_slice(KEY));
    let ciphertext = cipher
        .encrypt(GenericArray::from_slice(NONCE), glsl_code.as_bytes())
        .expect("encryption failure!");
    base64::encode(&ciphertext)
}

#[wasm_bindgen]
pub struct Painter {
    webgl: Rc<RefCell<WebGL>>,
}

#[wasm_bindgen]
impl Painter {
    pub fn new(sun_sita: f64) -> Self {
        let vertex_shader_source = include_str!("../glsl/secret.vert").to_owned();
        let fragment_shader_source = include_str!("../glsl/secret.frag").to_owned();
        log("start");

        let webgl = Rc::new(RefCell::new(WebGL::new(sun_sita)));

        webgl
            .borrow_mut()
            .set_shader(vertex_shader_source, fragment_shader_source);

        webgl.borrow_mut().draw();
        Self { webgl }
    }

    pub fn update(&self, sun_sita: f64) {
        self.webgl.borrow_mut().time_flow(sun_sita);
    }
}
/*
pub fn start() {
    let vertex_shader_source = include_str!("../glsl/secret.vert").to_owned();
    let fragment_shader_source = include_str!("../glsl/secret.frag").to_owned();
    log("start");

    let webgl = Rc::new(RefCell::new(WebGL::new()));

    webgl
        .borrow_mut()
        .set_shader(vertex_shader_source, fragment_shader_source);

    webgl.borrow_mut().draw();

    return;

    let window = web_sys::window().expect("no global `window` exists");
    let window = Rc::new(window); // 包装 `window` 到 `Rc<T>`

    let f = Rc::new(RefCell::new(None::<Closure<dyn FnMut()>>));
    let g = f.clone();

    // 在移动到闭包之前克隆 `window`
    let window_clone = Rc::clone(&window);
    let webgl_clone = Rc::clone(&webgl);

    *g.borrow_mut() = Some(Closure::wrap(Box::new(move || {
        webgl_clone.borrow_mut().draw();

        window_clone
            .request_animation_frame(f.borrow().as_ref().unwrap().as_ref().unchecked_ref())
            .expect("should register `requestAnimationFrame` OK");
    }) as Box<dyn FnMut()>));

    window
        .add_event_listener_with_callback("keydown", keydown_closure.as_ref().unchecked_ref())
        .expect("add_event_listener_with_callback failed");

    keydown_closure.forget();
} */
