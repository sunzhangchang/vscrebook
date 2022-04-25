declare type DisplayMode =
	| 'statusBar'
	| 'showInformation'

declare type ConfigType = {
	pageSize: number,
	downloadPath: string,
	autoFlipTime: number,
	displayMode: DisplayMode,
}

declare type Source =
	| '本地'
	| '采墨阁'

declare type BookInfo = {
	bookName: string,
	pageSize: number,
	curPage: number,
	source: Source,
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
	书源: Source
}

declare type ConfigSetObj = Record<string, {
	name: string
	default: | number | string | object
	type: | 'number' | 'string' | 'object'
	form: | 'input' | 'choose'
	choices?: string[]
}>
