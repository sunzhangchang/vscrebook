declare type ConfigType = {
	pageSize: number,
	downloadPath: string,
	autoFlipTime: number,
	sync: Object,
}

declare type BookInfo = {
	bookName: string,
	pageSize: number,
	curPage: number,
}

declare type SearchBook = {
	书名: string
	作者: string
	状态: string
	分类: string
	字数: string
	简介: string
	最新章节: string
	最近更新: string
	目录链接: string
	书源: string
}
