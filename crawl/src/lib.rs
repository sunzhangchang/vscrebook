mod config;
mod utils;
mod crawlers;
mod search_book;

use std::{path::PathBuf, io::Write};

use crawlers::wbxsw::Wbxsw;
use crawlers::crawl::Crawl;
use crawlers::aixiashu::Aixiashu;
use crawlers::caimoge::Caimoge;
use crawlers::maxreader::Maxreader;
use futures::future::join_all;
use js_sys::{Object, Reflect};
use search_book::SearchBook;
use wasm_bindgen::prelude::*;


#[wasm_bindgen(js_name = rsSearch)]
pub async fn rs_search(search_key: String) -> Object {
    let mut results: Vec<SearchBook> = Vec::new();
    let mut errors: Vec<String> = Vec::new();

    macro_rules! s {
        ($x: expr) => {
            $x.search(&search_key)
        }
    }

    let res = join_all([
        s!(Aixiashu{}),
        s!(Caimoge{}),
        s!(Wbxsw{}),
        s!(Maxreader{}),
    ]).await;

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

    for i in res {
        push_res!(i);
    }
    // push_res!(res.0);

    let obj = Object::default();
    Reflect::set(&obj, &"results".into(), &serde_json::to_string(&results).unwrap().into()).unwrap();
    Reflect::set(&obj, &"errors".into(), &serde_json::to_string(&errors).unwrap().into()).unwrap();
    obj
}

#[wasm_bindgen(js_name = rsDownload)]
pub async fn rs_download(source: String, menu_url: String, dir: String, name: String) -> Result<String, String> {
    let result = match source.as_str() {
        Aixiashu::SOURCE_NAME => Aixiashu{}.download(&menu_url),
        Caimoge::SOURCE_NAME => Caimoge{}.download(&menu_url),
        Wbxsw::SOURCE_NAME => Wbxsw{}.download(&menu_url),
        Maxreader::SOURCE_NAME => Maxreader{}.download(&menu_url),
        _ => unreachable!(),
    }.await;

    match result {
        Ok(data) => {
            let mut buffer = PathBuf::from(&dir);
            buffer.push(&name);
            buffer.set_extension("txt");
    
            let path = buffer.as_path();
    
            std::fs::create_dir_all(&dir).unwrap();
    
            let mut f = std::fs::File::create(path).unwrap();
            f.write(data.as_bytes()).unwrap();

            if let Some(path) = path.as_os_str().to_str() {
                Ok(path.to_string())
            } else {
                Err("The download path is not a valid UTF-8 string".to_string())
            }
        }
        Err(e) => Err(e)
    }
}
