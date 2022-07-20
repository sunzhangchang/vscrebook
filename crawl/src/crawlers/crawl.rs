use async_trait::async_trait;

use crate::{SearchBook, config::{g_config, DownSet}};

#[async_trait(?Send)]
pub trait Crawl {
    // const SOURCE_URL: &'static str;
    const SOURCE_NAME: &'static str;
    const SEARCH_URL: &'static str;
    const SEARCH_QUERY: &'static str;

    async fn search_detail(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>>;

    async fn search(&self, search_key: &str) -> reqwest::Result<Vec<SearchBook>> {
        let configs = g_config();
        // unsafe { log(format!("{:?}", configs).as_str()); }
        
        if let DownSet::Disable = match Self::SOURCE_NAME {
            "爱下书" => configs.download_settings.aixiashu,
            "采墨阁" => configs.download_settings.caimoge,
            "五八小说网" => configs.download_settings.wbxsw,
            _ => DownSet::default(),
        } {
            return Ok(vec![]);
        }

        self.search_detail(search_key).await
    }
}
