use std::fmt::Debug;

// use async_trait::async_trait;
use js_sys::{Object, Array, Reflect};
use wasm_bindgen::prelude::*;

#[derive(Default)]
struct ShowMoreInfo {
    caimoge: bool,
    wbxsw: bool,
    aixiashu: bool,
}

// #[wasm_bindgen(raw_module = "../../src/define_in_js")]
// extern "C" {
//     #[wasm_bindgen(extends = Object, typescript_type = "ShowMoreInfo")]
//     type ShowMoreInfo;

//     #[wasm_bindgen(constructor)]
//     fn dft() -> ShowMoreInfo;
// }

// impl Default for ShowMoreInfo {
//     fn default() -> Self {
//         Self::dft()
//     }
// }

enum DownSet {
    Disable,
    TxtOnly,
    ChaptersOnly,
    TxtAndChapters,
}

#[derive(Default)]
struct DownloadSettings {
    caimoge: String,
    wbxsw: String,
    aixiashu: String,
}

// #[wasm_bindgen(raw_module = "../../src/define_in_js")]
// extern "C" {
//     #[wasm_bindgen(extends = Object, typescript_type = "DownloadSettings")]
//     type DownloadSettings;

//     #[wasm_bindgen(constructor)]
//     fn dft() -> DownloadSettings;
// }

// impl Default for DownloadSettings {
//     fn default() -> Self {
//         Self::dft()
//     }
// }

// type DownloadSettings = HashMap<String, String>;

type DownThreadAmount = u16;

#[derive(Default)]
struct Config {
    show_more_info: ShowMoreInfo,
    download_settings: DownloadSettings,
    down_thread_amount: DownThreadAmount,
}

#[wasm_bindgen(raw_module = "../../src/define_in_js")]
extern "C" {
    fn get_config() -> JsValue;
}

//Vec<(String, JsValue)>
fn forin<F>(obj: JsValue, func: &mut F) -> Result<(), String>
    where F: FnMut(&str, JsValue) -> () {
    if obj.is_object() {
        // let mut res = Vec::new();
        for it in Array::iter(&Object::entries(&obj.into())) {
            let a: Array = it.into();
            let key: &str = &a.at(0).as_string().unwrap();
            let value: JsValue = a.at(1);
            func(key, value)
            // res.push((key.to_string(), value));
        }
        Ok(())
        // Ok(res)
    } else {
        Err("value is not an object".to_string())
    }
}

fn g_config() -> Config {
    let js_configs = unsafe { get_config() };
    let mut config = Config::default();
    forin(js_configs, &mut |k, v| {
        match k {
            "showMoreInfo" => {
                forin(v, &mut |k, v| {
                    match k {
                        "caimoge" => {
                            config.show_more_info.caimoge = v.as_bool().unwrap();
                        }
                        "wbxsw" => {
                            config.show_more_info.wbxsw = v.as_bool().unwrap();
                        }
                        "aixiashu" => {
                            config.show_more_info.aixiashu = v.as_bool().unwrap();
                        }
                        _ => {}
                    }
                }).unwrap_or_default();
            }
            "downloadSettings" => {
                forin(v, &mut |k, v| {
                    match k {
                        "caimoge" => {
                            config.download_settings.caimoge = v.as_string().unwrap();
                        }
                        "wbxsw" => {
                            config.download_settings.wbxsw = v.as_string().unwrap();
                        }
                        "aixiashu" => {
                            config.download_settings.aixiashu = v.as_string().unwrap();
                        }
                        _ => {}
                    }
                }).unwrap_or_default();
            }
            "downThreadAmount" => {
                config.down_thread_amount = v.as_f64().unwrap() as u16
            }
            _ => {}
        }
    }).unwrap_or_default();
    config
}

// fn g_config() -> Config {
//     let js_configs = unsafe { get_config() };
//     let js_download_settings = unsafe { Reflect::get(&js_configs, &"downloadSettings".into()).unwrap() };
//     let mut config = Config::default();
//     if js_download_settings.is_object() {
//         let t: Object = js_download_settings.into();
//         for i in Array::iter(&Object::entries(&t)) {
//             let a: Array = i.into();
//             let key: &str = &a.at(0).as_string().unwrap();
//             let value: JsValue = a.at(1);
//             match key {
//                 "showMoreInfo" => {
//                     config.show_more_info = value.into();
//                 }
//                 "downThreadAmount" => {
//                     config.down_thread_amount = value.as_f64().unwrap() as u16
//                 }
//                 "downloadSettings" => {
//                     config.download_settings = value.into();
//                 }
//                 &_ => {}
//             };
//         }
//     }
//     config
// }

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
        let source_name = self.info.source_name.as_str();
        if match source_name {
            "aixiashu" => &configs.download_settings.aixiashu,
            "caimoge" => &configs.download_settings.caimoge,
            "wbxsw" => &configs.download_settings.wbxsw,
            _ => "",
        } == "disable" {
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
