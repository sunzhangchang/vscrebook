use std::collections::HashMap;

use js_sys::{Array, Object};
use wasm_bindgen::prelude::*;

use crate::utils::util::mydebug;


// #[derive(Default)]
// pub struct ShowMoreInfo {
//     pub caimoge: bool,
//     pub wbxsw: bool,
//     pub aixiashu: bool,
//     pub maxreader: bool,
// }

pub type ShowMoreInfo = HashMap<String, bool>;

#[derive(Default)]
pub enum DownSet {
    #[default]
    Disable,
    TxtOnly,
    ChaptersOnly,
    TxtAndChapters,
}
// 'disable' | 'txtOnly' | 'chaptersOnly' | 'txt & chapters'

// #[derive(Default)]
// pub struct DownloadSettings {
//     pub caimoge: DownSet,
//     pub wbxsw: DownSet,
//     pub aixiashu: DownSet,
// }

pub type DownloadSettings = HashMap<String, DownSet>;

type ThreadNum = u16;

#[derive(Default)]
pub struct Config {
    pub show_more_info: ShowMoreInfo,
    pub download_settings: DownloadSettings,
    pub thread_num: ThreadNum,
}

#[wasm_bindgen(raw_module = "../../src/define_in_js")]
extern "C" {
    fn get_config() -> JsValue;
}

fn forin<F>(obj: JsValue, func: &mut F) -> Result<(), String>
    where F: FnMut(&str, JsValue) -> () {
    if obj.is_object() {
        // let mut res = Vec::new();
        for it in Array::iter(&Object::entries(&obj.into())) {
            let a: Array = it.into();
            if let Some(key) = a.at(0).as_string() {
                let value: JsValue = a.at(1);
                func(&key, value);
            }
            // res.push((key.to_string(), value));
        }
        Ok(())
        // Ok(res)
    } else {
        Err("value is not an object".to_string())
    }
}

pub fn g_config() -> Config {
    let js_configs = get_config();
    let mut config = Config::default();
    forin(js_configs, &mut |k, v| {
        match k {
            "showMoreInfo" => {
                forin(v, &mut |k, v| {
                    if let Some(v) = v.as_bool() {
                        config.show_more_info.insert(k.to_string(), v);
                    }
                    // match k {
                    //     "caimoge" => {
                    //         smi.caimoge = v.as_bool().unwrap();
                    //     }
                    //     "wbxsw" => {
                    //         smi.wbxsw = v.as_bool().unwrap();
                    //     }
                    //     "aixiashu" => {
                    //         smi.aixiashu = v.as_bool().unwrap();
                    //     }
                    //     "maxreader" => {
                    //         smi.maxreader = v.as_bool().unwrap();
                    //     }
                    //     _ => {}
                    // }
                }).unwrap_or_default();
            }
            "downloadSettings" => {
                forin(v, &mut |k, v| {
                    let match_downset = |s: JsValue| {
                        if let Some(s) = s.as_string() {
                            match s.as_str() {
                                "disable" => DownSet::Disable,
                                "txtOnly" => DownSet::TxtOnly,
                                "chaptersOnly" => DownSet::ChaptersOnly,
                                "txt & chapters" => DownSet::TxtAndChapters,
                                _ => DownSet::default(),
                            }
                        } else {
                            DownSet::default()
                        }
                    };
                    config.download_settings.insert(k.to_string(), match_downset(v));
                    // let downset = &mut config.download_settings;
                    // match k {
                    //     "caimoge" => downset.caimoge = match_downset(v),
                    //     "wbxsw" => downset.wbxsw = match_downset(v),
                    //     "aixiashu" => downset.aixiashu = match_downset(v),
                    //     _ => (),
                    // }
                }).unwrap_or_default();
            }
            "threadNum" => {
                config.thread_num = if let Some(v) = v.as_f64() {
                    mydebug(&v.to_string());
                    // v as u16
                    if let Ok(v) = v.to_string().parse() {
                        v
                    } else {
                        20
                    }
                } else {
                    20
                }
            }
            _ => {}
        }
    }).unwrap_or_default();
    config
}
