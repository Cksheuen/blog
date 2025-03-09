use std::env;
use std::fs;

use aes_gcm::aead::{generic_array::GenericArray, Aead, NewAead};
use aes_gcm::Aes256Gcm; // Or another AES variant
use base64;

const KEY: &[u8; 32] = b"\x00\x0c\x00\x00\x00\x44\x00\x00\x00\x12\x00\x00\x00\x34\x00\x00\x00\x56\x00\x00\x00\x78\x00\x00\x00\x9a\x00\x00\x00\xbc\x00\x00";
const NONCE: &[u8; 12] = b"\x00\x0a\x00\x0b\x00\x0c\x00\x0d\x00\x0e\x00\x0f";

fn encrypt_glsl_code(glsl_code: &str) -> String {
    let cipher = Aes256Gcm::new(GenericArray::from_slice(KEY));
    let ciphertext = cipher
        .encrypt(GenericArray::from_slice(NONCE), glsl_code.as_bytes())
        .expect("encryption failure!");
    base64::encode(&ciphertext)
}

fn main() {
    let current_dir = env::current_dir().expect("Unable to get current directory");
    let output_dir = current_dir.join("glsl");

    let vertex_shader_path = output_dir.join("game.vert");
    let fragment_shader_path = output_dir.join("game.frag");

    let vertex_shader_source =
        fs::read_to_string(vertex_shader_path).expect("Unable to read vertex shader file");
    let fragment_shader_source =
        fs::read_to_string(fragment_shader_path).expect("Unable to read fragment shader file");

    let encrypted_vertex_shader = encrypt_glsl_code(&vertex_shader_source);
    let encrypted_fragment_shader = encrypt_glsl_code(&fragment_shader_source);

    let secret_vertex_shader_path = output_dir.join("secret.vert");
    let secret_fragment_shader_path = output_dir.join("secret.frag");

    fs::write(secret_vertex_shader_path, encrypted_vertex_shader)
        .expect("Unable to write secret vertex shader file");
    fs::write(secret_fragment_shader_path, encrypted_fragment_shader)
        .expect("Unable to write secret fragment shader file");
}
