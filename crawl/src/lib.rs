use std::collections::HashMap;

use async_trait::async_trait;
use reqwest::Result;
use serde::Deserialize;
use wasm_bindgen::prelude::*;

#[derive(Deserialize)]
struct ShowMoreInfo {
    caimoge: bool,
    wbxsw: bool,
    aixiashu: bool,
}

enum DownSet {
    Disable,
    TxtOnly,
    ChaptersOnly,
    TxtAndChapters,
}

type DownloadSettings = HashMap<String, DownSet>;

type DownThreadAmount = u16;

#[derive(Deserialize)]
struct Config {
    show_more_info: ShowMoreInfo,
    download_settings: DownloadSettings,
    down_thread_amount: DownThreadAmount,
}

fn to_config(s: &mut String) -> Config {
}

#[wasm_bindgen]
extern "C" {
    fn get_config() -> JsValue;
}

// declare type SearchBook = {
//     书名: string
//     作者: string
//     状态: string
//     分类: string
//     字数: string
//     简介: string
//     最新章节: string
//     最近更新: string
//     目录链接: string
//     书源: Source
// }

#[wasm_bindgen]
struct search_book {
}

#[async_trait]
trait Crawl {
    async fn search(search_key: &str) -> Result<Vec<search_book>>;
}

struct ACrawl {
}

#[async_trait]
impl Crawl for ACrawl {
    async fn search(&mut self, search_key: &str) -> Result<Vec<search_book>> {
        unsafe {
            let configs = get_config().to_config();
        }
        if (_.isEqual(getConfig().downloadSettings[this.sourceName], 'disable')) {
            return []
        }
        return this.searchDetail(searchKey)
        Ok(list)
    }
}

struct Caimoge {
}


#[wasm_bindgen]
pub async fn search(search_key: &str) -> Result<Vec<search_book>> {
    let mut list = Vec::new();
    let crawlers = [];
    for i in crawlers {
        list.append(i.search(search_key).await?)
    }
    Ok(list)
}
