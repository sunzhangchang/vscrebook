mod config;
mod utils;
mod crawlers;
mod search_book;

use crawlers::wbxsw::Wbxsw;
use crawlers::crawl::Crawl;
use crawlers::aixiashu::Aixiashu;
use crawlers::caimoge::Caimoge;
use crawlers::maxreader::Maxreader;
use futures::future::join_all;
use search_book::SearchBook;
use wasm_bindgen::prelude::*;
use utils::util::{myerror, mydebug};


#[wasm_bindgen(js_name = rsSearch)]
pub async fn rs_search(search_key: String) -> JsValue {
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
                    Err(e) => {
                        myerror("requestError");
                        errors.push(e.to_string());
                    },
                }
            )*
        };
    }

    for i in res {
        push_res!(i);
    }

    serde_wasm_bindgen::to_value(&(results, errors)).unwrap()
}

#[wasm_bindgen(js_name = rsDownload)]
pub async fn rs_download(source: String, menu_url: String) -> Option<String> {
    mydebug(&format!("[rs_download] source: {}; menu_url: {}", source, menu_url));

    let result = match source.as_str() {
        Aixiashu::SOURCE_NAME => Aixiashu{}.download(&menu_url),
        Caimoge::SOURCE_NAME => Caimoge{}.download(&menu_url),
        Wbxsw::SOURCE_NAME => Wbxsw{}.download(&menu_url),
        Maxreader::SOURCE_NAME => Maxreader{}.download(&menu_url),
        _ => unreachable!(),
    }.await;

    match result {
        Ok(data) => {
            mydebug("done here!");
            Some(data)
        }
        Err(e) => {
            myerror(&e);
            None
        }
    }
}
