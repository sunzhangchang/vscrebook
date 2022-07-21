pub mod net {
    use reqwest::{Client, header::USER_AGENT};

    pub async fn get(url: &str, query: Option<(&str, &str)>) -> reqwest::Result<reqwest::Response> {
        let bulider =  Client::new().get(url)
            .header(USER_AGENT, "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36");

        if let Some(query) = query {
            bulider.query(&[query])
        } else {
            bulider
        }
        .send()
        .await
    }
}