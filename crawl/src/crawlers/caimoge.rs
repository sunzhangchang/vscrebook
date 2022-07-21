use async_trait::async_trait;
use nipper::Document;
use reqwest::Url;

use crate::{utils::net::get, search_book::SearchBook};

use super::crawl::Crawl;

pub struct Caimoge;

#[async_trait(?Send)]
impl Crawl for Caimoge {
    const SOURCE_NAME: &'static str = "采墨阁";
    const SEARCH_URL: &'static str = "https://www.caimoge.net/search/";
    const SEARCH_QUERY: &'static str = "searchkey";

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let response = get(Self::SEARCH_URL, Some(("searchkey", search_key))).await?;

        let doc = Document::from(&response.text().await?);
        let list = doc.select("#sitembox dl");

        let mut result = Vec::new();
        for i in list.iter() {
            let menu_url = i.select("dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)").attr("href");
            if let Some(url) = menu_url {
                if let Ok(u) = Url::parse(Self::SEARCH_URL) {
                    if let Ok(menu_url) = u.join(url.to_string().as_str()) {
                        result.push(SearchBook {
                            书名: i.select("dd:nth-child(2) > h3:nth-child(1) > a:nth-child(1)").text().to_string(),
                            作者: i.select("dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)").text().to_string(),
                            状态: i.select("dd:nth-child(3) > span:nth-child(2)").text().to_string(),
                            分类: i.select("dd:nth-child(3) > span:nth-child(3)").text().to_string(),
                            字数: i.select("dd:nth-child(3) > span:nth-child(4)").text().to_string(),
                            简介: i.select("dd:nth-child(4)").text().to_string(),
                            最新章节: i.select("dd:nth-child(5) > a:nth-child(1)").text().to_string(),
                            最近更新: i.select("dd:nth-child(5) > span:nth-child(2)").text().to_string(),
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
