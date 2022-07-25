// https://www.maxreader.la/search/result.html?searchkey=%E6%88%91%E7%9A%84

use async_trait::async_trait;
use nipper::Document;
use reqwest::Url;

use crate::{utils::net::get, search_book::SearchBook, config::g_config};

use super::crawl::Crawl;

pub struct Maxreader;

#[async_trait(?Send)]
impl Crawl for Maxreader {
    const SOURCE_NAME: &'static str = "醉读";
    const SEARCH_URL: &'static str = "https://www.maxreader.la/search/result.html";
    const SEARCH_QUERY: &'static str = "searchkey";

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let response = get(Self::SEARCH_URL, Some((Self::SEARCH_QUERY, search_key))).await?;

        let doc = Document::from(&response.text().await?);
        let list = doc.select("div.pt-rank-detail");

        let mut result = Vec::new();
        for i in list.iter() {
            let menu_url = i.select("a:nth-child(1)").attr("href");
            if let Some(url) = menu_url {
                let url: String = url.into();
                let url = url.replace("read", "book");
                if let Ok(u) = Url::parse(Self::SEARCH_URL) {
                    if let Ok(menu_url) = u.join(&url) {
                        let mut status = "未知".to_string();
                        let mut number = "未知".to_string();
                        let mut synopsis = "未知".to_string();

                        let f = (&g_config().show_more_info)["maxreader"];

                        if f {
                            let response = get(menu_url.as_str(), None).await?;
                            let doc = Document::from(&response.text().await?);
                            status = doc.select(".count > ul:nth-child(1) > li:nth-child(5) > span:nth-child(1)").text().to_string();
                            number = doc.select(".count > ul:nth-child(1) > li:nth-child(11) > span:nth-child(1)").text().to_string();
                            synopsis = doc.select("#bookintro > p:nth-child(1)").text().to_string();
                        }

                        result.push(SearchBook {
                            书名: i.select("a:nth-child(1)").attr("title").unwrap_or("未知".into()).to_string(),
                            作者: i.select("div:nth-child(2) > div:nth-child(1) > span:nth-child(2) > span:nth-child(1) > a:nth-child(1)").attr("title").unwrap_or("未知".into()).to_string(),
                            状态: status,
                            分类: i.select("div:nth-child(2) > div:nth-child(1) > span:nth-child(2) > span:nth-child(2) > a:nth-child(1)").text().to_string(),
                            字数: number,
                            简介: synopsis,
                            最新章节: i.select("div:nth-child(2) > div:nth-child(3) > span:nth-child(1) > a:nth-child(1) > span:nth-child(1)").text().to_string(),
                            最近更新: "未知".to_string(),
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

    const CHAPTERS_SELECTOR: &'static str = "#readerlists > ul:nth-child(1) > li > a:nth-child(1)";
    const CHAPTERS_TITLE_SELECTOR: &'static str = "a.color7:nth-child(1)";
    const CONTEXT_SELECTOR: &'static str = "div.size16";
}
