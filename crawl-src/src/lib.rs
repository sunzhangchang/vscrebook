use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run(s: &str) -> () {
    println!("hello, {}", s);
}
