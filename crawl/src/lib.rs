mod config;
mod utils;
mod crawlers;
mod search_book;

use crawlers::{crawl::Crawl, caimoge::Caimoge};
use crawlers::aixiashu::Aixiashu;
use js_sys::{Object, Reflect};
use search_book::SearchBook;
use wasm_bindgen::prelude::*;

async fn search_one(result: &mut Vec<SearchBook>, errors: &mut Vec<String>, crawler: impl Crawl, search_key: &str) -> () {
    let res = crawler.search(&search_key).await;
    match res {
        Ok(mut res) => result.append(&mut res),
        Err(e) => errors.push(e.to_string()),
    }
}

#[wasm_bindgen]
pub async fn search(search_key: String) -> Object {
    let mut result: Vec<SearchBook> = Vec::new();
    let mut errors: Vec<String> = Vec::new();
    search_one(&mut result, &mut errors, Aixiashu{}, &search_key).await;
    search_one(&mut result, &mut errors, Caimoge{}, &search_key).await;
    let obj = Object::default();
    Reflect::set(&obj, &"result".into(), &serde_json::to_string(&result).unwrap().into()).unwrap();
    Reflect::set(&obj, &"errors".into(), &serde_json::to_string(&errors).unwrap().into()).unwrap();
    obj
}
