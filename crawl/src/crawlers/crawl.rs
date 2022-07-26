use async_trait::async_trait;
use futures::future::join_all;
use nipper::Document;
use reqwest::Url;

use crate::{SearchBook, config::{g_config, DownSet}, utils::{net::get, util::mydebug}};

#[async_trait(?Send)]
pub trait Crawl {
    const SOURCE_NAME: &'static str;
    const SOURCE_NAME_ENG: &'static str;
    const SEARCH_URL: &'static str;
    const SEARCH_QUERY: &'static str;

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>>;

    async fn search(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        mydebug(&format!("{}: search {}", Self::SOURCE_NAME, search_key));
        let configs = g_config();

        if let Some(DownSet::Disable) = configs.download_settings.get(Self::SOURCE_NAME_ENG) {
            mydebug(&format!("{}: disable", Self::SOURCE_NAME));
            return Ok(vec![]);
        }

        mydebug(&format!("{}: {:?}", Self::SOURCE_NAME, configs.download_settings.get(Self::SOURCE_NAME_ENG)));

        self.search_detail(search_key).await
    }

    const CHAPTERS_SELECTOR: &'static str;
    const CHAPTERS_TITLE_SELECTOR: &'static str;
    const CONTEXT_SELECTOR: &'static str;

    async fn get_one_chapter(&self, url: String) -> reqwest::Result<String> {
        let response = get(&url, None).await?;
        let doc = Document::from(&response.text().await?);
        let title = doc.select(Self::CHAPTERS_TITLE_SELECTOR).text();
        let context = doc.select(Self::CONTEXT_SELECTOR).text();
        Ok(format!("======== {} ======== \n {}", title, context))
    }

    async fn get_chapters(&self, menu_url: &str) -> reqwest::Result<Vec<String>> {
        let response = get(menu_url, None).await?;

        let doc = Document::from(&response.text().await?);
        let l = doc.select(Self::CHAPTERS_SELECTOR);
        let mut list = Vec::new();
        for e in l.iter() {
            let url = e.attr("href");
            if let Some(url) = url {
                let url = Url::parse(Self::SEARCH_URL).unwrap().join(&url.to_string()).unwrap();
                list.push(self.get_one_chapter(url.into()));
            } else {
                continue;
            }
        }
        let list = join_all(list).await;
        let mut result = Vec::new();
        for i in list {
            result.push(i?);
        }
        Ok(result)
    }

    async fn download(&self, menu_url: &str) -> Result<String, String> {
        let configs = g_config();
        let st = configs.download_settings.get(Self::SOURCE_NAME);
        if matches!(st, Some(DownSet::Disable | DownSet::TxtOnly)) {
            return Err("".to_string());
        }
        let res = self.get_chapters(menu_url).await;
        if let Ok(res) = res {
            Ok(res.join("    "))
        } else {
            Err("".to_string())
        }
    }
}