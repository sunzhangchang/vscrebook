mod config;
mod utils;
mod crawlers;
mod search_book;

use crawlers::crawl::Crawl;
use crawlers::aixiashu::Aixiashu;
use js_sys::{Object, Reflect};
use search_book::SearchBook;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub async fn search(search_key: String) -> Object {
    let mut result: Vec<SearchBook> = Vec::new();
    let mut errs: Vec<String> = Vec::new();
    {
        let res = Aixiashu{}.search(&search_key).await;
        match res {
            Ok(mut res) => result.append(&mut res),
            Err(e) => errs.push(e.to_string()),
        }
    }
    let obj = Object::default();
    // let result: Vec<SearchBookI> = list.iter().map(|s: &SearchBook| { s.into() }).collect();
    Reflect::set(&obj, &"result".into(), &serde_json::to_string(&result).unwrap().into()).unwrap();
    Reflect::set(&obj, &"errors".into(), &serde_json::to_string(&errs).unwrap().into()).unwrap();
    obj
}
