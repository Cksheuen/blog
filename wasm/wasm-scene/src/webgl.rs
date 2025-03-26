extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

extern crate web_sys;
use web_sys::{window, WebGlProgram, WebGlRenderingContext, WebGlShader, WebGlUniformLocation};

use crate::utils::{self, Vec2};

use aes_gcm::aead::{generic_array::GenericArray, Aead, NewAead};
use aes_gcm::Aes256Gcm; // Or another AES variant
use base64;

const KEY: &[u8; 32] = b"\x00\x0c\x00\x00\x00\x44\x00\x00\x00\x12\x00\x00\x00\x34\x00\x00\x00\x56\x00\x00\x00\x78\x00\x00\x00\x9a\x00\x00\x00\xbc\x00\x00";
const NONCE: &[u8; 12] = b"\x00\x0a\x00\x0b\x00\x0c\x00\x0d\x00\x0e\x00\x0f";

fn decrypt_glsl_code(encrypted_code: &str) -> String {
    let cipher = Aes256Gcm::new(GenericArray::from_slice(KEY));
    let ciphertext = base64::decode(encrypted_code).expect("base64 decode failure!");
    let plaintext = cipher
        .decrypt(GenericArray::from_slice(NONCE), ciphertext.as_ref())
        .expect("decryption failure!");
    String::from_utf8(plaintext).expect("utf8 conversion failure!")
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_str(s: &str);
}

pub struct WebGL {
    canvas: web_sys::HtmlCanvasElement,
    context: web_sys::WebGlRenderingContext,
    program: Option<web_sys::WebGlProgram>,
    start_time: f64,
    i_resolution_location: Option<WebGlUniformLocation>,
    i_time_location: Option<WebGlUniformLocation>,
    ro_location: Option<WebGlUniformLocation>,
    ta_location: Option<WebGlUniformLocation>,
    cam_mat_location: Option<WebGlUniformLocation>,
    sita_location: Option<WebGlUniformLocation>,
    update: bool,
    tar_point: Vec2,
    sita: f64,
}

impl WebGL {
    /**
     * fn new() -> WebGL
     * 创建一个WebGL对象
     * @return WebGL
     * @param it: f64
     */
    pub fn new(sun_sita: f64) -> WebGL {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id("canvas").unwrap();
        let canvas: web_sys::HtmlCanvasElement = canvas
            .dyn_into::<web_sys::HtmlCanvasElement>()
            .map_err(|_| ())
            .unwrap();
        canvas.set_width((window().unwrap().inner_width().unwrap().as_f64().unwrap() * 0.8) as u32);
        canvas
            .set_height((window().unwrap().inner_height().unwrap().as_f64().unwrap() * 0.8) as u32);
        let context = canvas.get_context("webgl").unwrap().unwrap();
        let start_time = web_sys::window().unwrap().performance().unwrap().now();
        // log_str("new webgl");
        WebGL {
            canvas,
            context: context
                .dyn_into::<web_sys::WebGlRenderingContext>()
                .unwrap(),
            program: None,
            start_time,
            i_resolution_location: None,
            i_time_location: None,
            ro_location: None,
            ta_location: None,
            cam_mat_location: None,
            sita_location: None,
            update: false,
            tar_point: Vec2::new(10.0, -0.1),
            sita: sun_sita,
        }
    }

    fn compile_shader(
        context: &WebGlRenderingContext,
        shader_type: u32,
        source: &str,
    ) -> Result<WebGlShader, String> {
        // log_str("compile_shader");
        // log_str(source);
        let shader = context
            .create_shader(shader_type)
            .ok_or_else(|| String::from("Unable to create shader object"))?;
        context.shader_source(&shader, source);
        context.compile_shader(&shader);

        if context
            .get_shader_parameter(&shader, WebGlRenderingContext::COMPILE_STATUS)
            .as_bool()
            .unwrap_or(false)
        {
            Ok(shader)
        } else {
            Err(context
                .get_shader_info_log(&shader)
                .unwrap_or_else(|| String::from("Unknown error creating shader")))
        }
    }

    fn link_program(
        context: &WebGlRenderingContext,
        vert_shader: &WebGlShader,
        frag_shader: &WebGlShader,
    ) -> Result<WebGlProgram, String> {
        let program = context
            .create_program()
            .ok_or_else(|| String::from("Unable to create shader object"))?;

        context.attach_shader(&program, vert_shader);
        context.attach_shader(&program, frag_shader);
        context.link_program(&program);

        if context
            .get_program_parameter(&program, WebGlRenderingContext::LINK_STATUS)
            .as_bool()
            .unwrap_or(false)
        {
            Ok(program)
        } else {
            Err(context
                .get_program_info_log(&program)
                .unwrap_or_else(|| String::from("Unknown error creating program object")))
        }
    }

    pub fn set_shader(&mut self, vert: String, frag: String) {
        let vert_source = decrypt_glsl_code(vert.as_str());
        let frag_source = decrypt_glsl_code(frag.as_str());
        let vert_shader = match WebGL::compile_shader(
            &self.context,
            WebGlRenderingContext::VERTEX_SHADER,
            vert_source.as_str(),
        ) {
            Ok(shader) => shader,
            Err(err) => {
                log_str(&err);
                return;
            }
        };
        let frag_shader = match WebGL::compile_shader(
            &self.context,
            WebGlRenderingContext::FRAGMENT_SHADER,
            frag_source.as_str(),
        ) {
            Ok(shader) => shader,
            Err(err) => {
                log_str(&err);
                return;
            }
        };

        let program = WebGL::link_program(&self.context, &vert_shader, &frag_shader).unwrap();
        self.program = Option::Some(program.clone());

        self.context.use_program(Some(&program));

        self.i_resolution_location = Some(
            self.context
                .get_uniform_location(&program, "iResolution")
                .unwrap(),
        );

        self.i_time_location = Some(
            self.context
                .get_uniform_location(&program, "iTime")
                .unwrap(),
        );
        self.ro_location = Some(self.context.get_uniform_location(&program, "ro").unwrap());
        // return;
        self.ta_location = match self.context.get_uniform_location(&program, "ta") {
            Some(location) => Some(location),
            None => {
                eprintln!("Error: Unable to get uniform location for 'ta'");
                None
            }
        };
        self.cam_mat_location = match self.context.get_uniform_location(&program, "camMat") {
            Some(location) => Some(location),
            None => {
                eprintln!("Error: Unable to get uniform location for 'camMat'");
                None
            }
        };
        self.sita_location = match self.context.get_uniform_location(&program, "sita") {
            Some(location) => Some(location),
            None => {
                eprintln!("Error: Unable to get uniform location for 'sita'");
                None
            }
        };

        WebGL::update_data(self);
    }

    pub fn draw(&mut self) {
        // log_str("draw");
        let window = web_sys::window().expect("should have a window in this context");
        let performance = window
            .performance()
            .expect("performance should be available");

        let time1 = performance.now();

        let time = web_sys::window().unwrap().performance().unwrap().now() - self.start_time;
        let gl = self.context.clone();
        gl.uniform3f(
            Some(self.i_resolution_location.as_ref().unwrap()),
            self.canvas.width() as f32,
            self.canvas.height() as f32,
            1.0,
        );
        gl.uniform1f(
            Some(self.i_time_location.as_ref().unwrap()),
            (time / 1000.0) as f32,
        );
        gl.uniform1f(Some(self.sita_location.as_ref().unwrap()), self.sita as f32);

        if (self.update) {
            self.update_data();
            self.update = false;
        }

        let position_location =
            gl.get_attrib_location(self.program.as_ref().unwrap(), "a_position");
        let buffer = gl.create_buffer().ok_or("failed to create buffer").unwrap();
        gl.bind_buffer(WebGlRenderingContext::ARRAY_BUFFER, Some(&buffer));
        let vertices: [f32; 8] = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0];
        gl.buffer_data_with_array_buffer_view(
            WebGlRenderingContext::ARRAY_BUFFER,
            &js_sys::Float32Array::from(&vertices[..]),
            WebGlRenderingContext::STATIC_DRAW,
        );

        gl.enable_vertex_attrib_array(position_location as u32);
        gl.vertex_attrib_pointer_with_i32(
            position_location as u32,
            2,
            WebGlRenderingContext::FLOAT,
            false,
            0,
            0,
        );

        let time2 = performance.now();

        gl.clear(WebGlRenderingContext::COLOR_BUFFER_BIT);
        gl.draw_arrays(WebGlRenderingContext::TRIANGLE_FAN, 0, 4);

        gl.finish();

        let time3 = performance.now();

        log_str(&format!("set time: {}", time2 - time1));
        log_str(&format!("draw time: {}", time3 - time2));
    }

    pub fn time_flow(&mut self, sun_sita: f64) {
        self.sita = sun_sita;
        self.update = true;
        self.draw();
    }

    pub fn update_data(&mut self) {
        let time1 = web_sys::window().unwrap().performance().unwrap().now();
        let data = utils::init_data(self.tar_point);
        let time2 = web_sys::window().unwrap().performance().unwrap().now();
        log_str(&format!("init data time: {}", time2 - time1));

        let gl = self.context.clone();
        gl.uniform3fv_with_f32_array(
            Some(self.ro_location.as_ref().unwrap()),
            data.ro.to_array().as_ref(),
        );
        if let Some(ta_location) = self.ta_location.as_ref() {
            gl.uniform3fv_with_f32_array(Some(ta_location), data.ta.to_array().as_ref());
        } else {
            eprintln!("Error: 'ta' uniform location is None");
        }

        if let Some(cam_mat_location) = self.cam_mat_location.as_ref() {
            gl.uniform_matrix3fv_with_f32_array(
                Some(cam_mat_location),
                false,
                data.cam_mat.to_array().as_ref(),
            );
        } else {
            eprintln!("Error: 'camMat' uniform location is None");
        }
    }
    pub fn move_camera(&mut self, x: f64, y: f64) {
        self.tar_point.x += x;
        self.tar_point.y += y;
        self.update = true;
    }
}
