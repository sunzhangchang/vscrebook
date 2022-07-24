mod config;
mod utils;
mod crawlers;
mod search_book;

use crawlers::wbxsw::Wbxsw;
use crawlers::crawl::Crawl;
use crawlers::aixiashu::Aixiashu;
use crawlers::caimoge::Caimoge;
use futures::join;
use js_sys::{Object, Reflect};
use search_book::SearchBook;
use wasm_bindgen::prelude::*;

use crate::crawlers::maxreader::Maxreader;

#[wasm_bindgen]
pub async fn search(search_key: String) -> Object {
    let mut results: Vec<SearchBook> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    macro_rules! s {
        ($x: expr) => {
            $x.search(&search_key)
        }
    }

    let res = join!(
        s!(Aixiashu{}),
        s!(Caimoge{}),
        s!(Wbxsw{}),
        s!(Maxreader{}),
    );

    macro_rules! push_res {
        ($($x: expr), *) => {
            $(
                match $x {
                    Ok(mut res) => results.append(&mut res),
                    Err(e) => errors.push(e.to_string()),
                }
            )*
        };
    }
    
    push_res!(res.0, res.1, res.2, res.3);

    let obj = Object::default();
    Reflect::set(&obj, &"results".into(), &serde_json::to_string(&results).unwrap().into()).unwrap();
    Reflect::set(&obj, &"errors".into(), &serde_json::to_string(&errors).unwrap().into()).unwrap();
    obj
}
