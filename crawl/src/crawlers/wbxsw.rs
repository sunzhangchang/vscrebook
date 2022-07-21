use async_trait::async_trait;
use nipper::Document;
use reqwest::Url;

use crate::{utils::net::get, search_book::SearchBook, config::g_config};

use super::crawl::Crawl;

pub struct Wbxsw;

#[async_trait(?Send)]
impl Crawl for Wbxsw {
    const SOURCE_NAME: &'static str = "58小说网";
    const SEARCH_URL: &'static str = "https://www.wbxsw.com/search.php";
    const SEARCH_QUERY: &'static str = "keyword";

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let response = get(Self::SEARCH_URL, Some((Self::SEARCH_QUERY, search_key))).await?;

        let doc = Document::from(&response.text().await?);
        let list = doc.select("div.result-item > div.result-game-item-detail");

        let mut result = Vec::new();
        for i in list.iter() {
            let menu_url = i.select("h3:nth-child(1) > a:nth-child(1)").attr("href");
            if let Some(url) = menu_url {
                if let Ok(u) = Url::parse(Self::SEARCH_URL) {
                    if let Ok(menu_url) = u.join(url.to_string().as_str()) {
                        let mut status = "未知".to_string();
                        if g_config().show_more_info.wbxsw {
                            let res = get(menu_url.as_str(), None).await;
                            if let Ok(res) = res {
                                let doc = Document::from(&res.text().await?);
                                status = doc.select("#info > p:nth-child(3)").text().to_string();
                                if status.contains("：") {
                                    status = status.split("：").last().unwrap().to_string();
                                }
                                if status.contains(",") {
                                    status = status.split(",").next().unwrap().to_string();
                                }
                            } else {
                                continue;
                            }
                        }
                        result.push(SearchBook {
                            书名: i.select("h3:nth-child(1) > a:nth-child(1)").attr("title").unwrap().to_string(),
                            作者: i.select("div:nth-child(3) > p:nth-child(1) > span:nth-child(2)").text().to_string(),
                            状态: status,
                            分类: i.select("div:nth-child(3) > p:nth-child(2) > span:nth-child(2)").text().to_string(),
                            字数: "未知".to_string(),
                            简介: i.select("p:nth-child(2)").text().to_string(),
                            最新章节: i.select("div:nth-child(3) > p:nth-child(4) > a:nth-child(2)").text().to_string(),
                            最近更新: i.select("div:nth-child(3) > p:nth-child(3) > span:nth-child(2)").text().to_string(),
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
