use async_trait::async_trait;
use nipper::Document;
use reqwest::Url;

use crate::{utils::net::get, config::g_config, SearchBook};

use super::crawl::Crawl;

pub struct Aixiashu;

#[async_trait(?Send)]
impl Crawl for Aixiashu {
    const SOURCE_NAME: &'static str = "爱下书";
    const SEARCH_URL: &'static str = "https://www.aixiaxsw.com/modules/article/search.php";
    const SEARCH_QUERY: &'static str = "searchkey";

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let response = get(Self::SEARCH_URL, Some((Self::SEARCH_QUERY, search_key))).await?;

        let doc = Document::from(&response.text().await?);
        let list = doc.select("#content > table > tbody > tr:nth-child(n+2)");

        let mut result = Vec::new();
        for i in list.iter() {
            let menu_url = i.select("td:nth-child(1) > a").attr("href");
            if let Some(url) = menu_url {
                if let Ok(u) = Url::parse(Self::SEARCH_URL) {
                    if let Ok(menu_url) = u.join(url.to_string().as_str()) {
                        let mut synopsis = "未知".to_string();
                        let mut cate = "未知".to_string();
                        if g_config().show_more_info.aixiashu {
                            let res = get(menu_url.as_str(), None).await;
                            if let Ok(res) = res {
                                let doc = Document::from(&res.text().await?);
                                synopsis = doc.select("#intro > p").text().to_string();
                                cate = doc.select("#wrapper > div:nth-child(6) > div.con_top > a:nth-child(3)").text().to_string();
                            } else {
                                continue;
                            }
                        }
                        result.push(SearchBook {
                            书名: i.select("td:nth-child(1) > a").text().to_string(),
                            作者: i.select("td:nth-child(3)").text().to_string(),
                            状态: i.select("td:nth-child(6)").text().to_string(),
                            分类: cate,
                            字数: i.select("td:nth-child(4)").text().to_string(),
                            简介: synopsis,
                            最新章节: i.select("td:nth-child(2) > a").text().to_string(),
                            最近更新: i.select("td:nth-child(5)").text().to_string(),
                            目录链接: menu_url.to_string(),
                            书源: Self::SOURCE_NAME.to_string(),
                        });
                    } else {
                        continue;
                    }
                } else {
                    continue;
                }
            } else {
                continue;
            }
        }
        Ok(result)
    }
}
