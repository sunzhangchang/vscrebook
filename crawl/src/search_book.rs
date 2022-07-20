use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SearchBook {
    pub 书名: String,
    pub 作者: String,
    pub 状态: String,
    pub 分类: String,
    pub 字数: String,
    pub 简介: String,
    pub 最新章节: String,
    pub 最近更新: String,
    pub 目录链接: String,
    pub 书源: String,
}
