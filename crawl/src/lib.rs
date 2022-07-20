use std::{fmt::Debug, str::FromStr};

use async_trait::async_trait;
// use async_trait::async_trait;
use js_sys::{Object, Array, Reflect};
use reqwest::{Url, header::USER_AGENT, Client};
use wasm_bindgen::prelude::*;

// #[wasm_bindgen]
// extern "C" {
//     #[wasm_bindgen(js_namespace = console)]
//     fn log(s: &str);
// }

#[derive(Default, Debug)]
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

#[derive(Default, Debug)]
enum DownSet {
    #[default]
    Disable,
    TxtOnly,
    ChaptersOnly,
    TxtAndChapters,
}
// 'disable' | 'txtOnly' | 'chaptersOnly' | 'txt & chapters'

#[derive(Default, Debug)]
struct DownloadSettings {
    caimoge: DownSet,
    wbxsw: DownSet,
    aixiashu: DownSet,
}

type DownThreadAmount = u16;

#[derive(Default, Debug)]
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
    let js_configs = get_config();
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
                    let match_downset = |s: JsValue| {
                        match s.as_string().unwrap().as_str() {
                            "disable" => DownSet::Disable,
                            "txtOnly" => DownSet::TxtOnly,
                            "chaptersOnly" => DownSet::ChaptersOnly,
                            "txt & chapters" => DownSet::TxtAndChapters,
                            _ => DownSet::default(),
                        }
                    };
                    let downset = &mut config.download_settings;
                    match k {
                        "caimoge" => downset.caimoge = match_downset(v),
                        "wbxsw" => downset.wbxsw = match_downset(v),
                        "aixiashu" => downset.aixiashu = match_downset(v),
                        _ => (),
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

struct Aixiashu;

#[async_trait(?Send)]
trait Crawl {
    const SOURCE_NAME: &'static str;
    const SEARCH_URL: &'static str;
    const SEARCH_QUERY: &'static str;

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let res = Client::new()
        // .get(Url::from_str("https://www.aixiaxsw.com/modules/article/search.php").unwrap())
        .get(Url::from_str(Self::SEARCH_URL).unwrap())
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36")
        .query(&[(Self::SEARCH_QUERY, search_key)])
        .send()
        .await?;

        res.bytes().await?;

        Ok(vec![])
    }
}

impl Crawl for Aixiashu {
    const SOURCE_NAME: &'static str = "aixiashu";
    const SEARCH_URL: &'static str = "https://www.aixiaxsw.com/modules/article/search.php";
    const SEARCH_QUERY: &'static str = "searchkey";
}

impl Aixiashu {
    async fn search(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let configs = g_config();
        // unsafe { log(format!("{:?}", configs).as_str()); }
        if let DownSet::Disable = configs.download_settings.aixiashu {
            return Ok(vec![]);
        }
        Ok(self.search_detail(search_key).await?)
    }
}

struct Caimoge;

impl Crawl for Caimoge {
    const SOURCE_NAME: &'static str = "caimoge";
    const SEARCH_URL: &'static str = "https://www.caimoge.net/search/";
    const SEARCH_QUERY: &'static str = "searchkey";
}

#[wasm_bindgen]
pub async fn search(search_key: String) -> Object {
    let mut list = Vec::new();
    let mut errs = Vec::new();
    {
        let res = Aixiashu{}.search(&search_key).await;
        match res {
            Ok(mut res) => list.append(&mut res),
            Err(e) => errs.push(e.to_string()),
        }
    }
    let obj = Object::default();
    Reflect::set(&obj, &"result".into(), &format!("{:?}", list).into()).unwrap();
    Reflect::set(&obj, &"errors".into(), &format!("{:?}", errs).into()).unwrap();
    obj
}
