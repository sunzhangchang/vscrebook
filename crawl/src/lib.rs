use std::fmt::Debug;

// use async_trait::async_trait;
use js_sys::{Object, Array, Reflect};
use wasm_bindgen::prelude::*;

// #[derive(Default)]
// struct ShowMoreInfo {
//     caimoge: bool,
//     wbxsw: bool,
//     aixiashu: bool,
// }

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends = Object, typescript_type = "ShowMoreInfo")]
    type ShowMoreInfo;

    #[wasm_bindgen(constructor)]
    fn dft() -> ShowMoreInfo;
}

impl Default for ShowMoreInfo {
    fn default() -> Self {
        Self::dft()
    }
}

enum DownSet {
    Disable,
    TxtOnly,
    ChaptersOnly,
    TxtAndChapters,
}

// #[derive(Default)]
// struct DownloadSettings {
//     caimoge: String,
//     wbxsw: String,
//     aixiashu: String,
// }

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(extends = Object, typescript_type = "DownloadSettings")]
    type DownloadSettings;

    #[wasm_bindgen(constructor)]
    fn dft() -> DownloadSettings;
}

impl Default for DownloadSettings {
    fn default() -> Self {
        Self::dft()
    }
}

// type DownloadSettings = HashMap<String, String>;

type DownThreadAmount = u16;

#[derive(Default)]
struct Config {
    show_more_info: ShowMoreInfo,
    download_settings: DownloadSettings,
    down_thread_amount: DownThreadAmount,
}

#[wasm_bindgen]
extern "C" {
    fn get_config() -> JsValue;
}

fn g_config() -> Config {
    let js_configs = unsafe { get_config() };
    let js_download_settings = unsafe { Reflect::get(&js_configs, &"downloadSettings".into()).unwrap() };
    let mut config = Config::default();
    if js_download_settings.is_object() {
        let t: Object = js_download_settings.into();
        for i in Array::iter(&Object::entries(&t)) {
            let a: Array = i.into();
            let key: &str = &a.at(0).as_string().unwrap();
            let value: JsValue = a.at(1);
            match key {
                "showMoreInfo" => {
                    config.show_more_info = value.into();
                }
                "downThreadAmount" => {
                    config.down_thread_amount = value.as_f64().unwrap() as u16
                }
                "downloadSettings" => {
                    config.download_settings = value.into();
                }
                &_ => {}
            };
        }
    }
    config
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
#[derive(Debug)]
pub struct SearchBook {
    // 书名: String,
    // 作者: String,
    // 状态: String,
    // 分类: String,
    // 字数: String,
    // 简介: String,
    // 最新章节: String,
    // 最近更新: String,
    // 目录链接: String,
    // 书源: Source,
}

// #[async_trait]
trait Crawl {
    fn search(&self, search_key: &str) -> Result<Vec<SearchBook>, String>;
    // async fn search(&self, search_key: &str) -> Result<Vec<SearchBook>, String>;
}

struct CrawlD {
    source_name: String,
}

struct ACrawl {
    info: CrawlD,
}

impl ACrawl {
    fn search_detail(&self, search_key: &str) -> Vec<SearchBook> {
        vec![]
    }
}

// #[async_trait]
impl Crawl for ACrawl {
    fn search(&self, search_key: &str) -> Result<Vec<SearchBook>, String> {
        let configs = g_config();
        let source_name = &((&self.info).source_name);
        if unsafe{Reflect::get(&configs.download_settings, &source_name.into())}.unwrap().as_string().unwrap() == "disable" {
            return Ok(vec![]);
        }
        Ok(self.search_detail(search_key))
    }
    // async fn search(&self, search_key: &str) -> Result<Vec<SearchBook>, String> {
    //     let configs = g_config();
    //     let source_name = &((&self.info).source_name);
    //     if unsafe{Reflect::get(&configs.download_settings, &source_name.into())}.unwrap().as_string().unwrap() == "disable" {
    //         return Ok(vec![]);
    //     }
    //     Ok(self.search_detail(search_key))
    // }
}

struct Caimoge {
}

#[wasm_bindgen]
pub fn search(search_key: String) -> String {
    let mut list = Vec::new();
    let c = ACrawl {
        info: CrawlD {
            source_name: "采墨阁".to_string(),
        }
    };
    list.append(&mut c.search(&search_key).unwrap());
    format!("{:?}", list)
}
// pub async fn search(search_key: String) -> String {
//     let mut list = Vec::new();
//     let c = ACrawl {
//         info: CrawlD {
//             source_name: "采墨阁".to_string(),
//         }
//     };
//     list.append(&mut c.search(&search_key).await.unwrap());
//     format!("{:?}", list)
// }
