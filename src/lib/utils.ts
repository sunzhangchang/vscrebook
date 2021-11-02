import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from "fs"
import { decode, encode } from 'iconv-lite'
import { ExtensionContext, workspace } from 'vscode'
import Book from './Book'

export const defaultPageSize = 25

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export enum extConfig {
	// curPage = 'vscrebook.curPageNumber',
	pageSize = 'vscrebook.pageSize',
	lineBreak = 'vscrebook.lineBreak',
}

export function detect(filePath: string) {
	let decode = detectFileSync(filePath, { sampleSize: 128 })
	if (!decode) {
		throw new Error('当前编码不支持')
	}
	return decode.toString()
}

export function copyFileTo_UTF8_Sync(oldPath: string, newPath: string, transform: (data: string) => string) {
	let buf = readFileSync(oldPath)
	let decod = detect(oldPath)
	let data = decode(buf, decod)
	buf = encode(data, 'utf8')
	data = buf.toString('utf8')
	data = transform(data)
	writeFileSync(newPath, data)
}

export function isUndef(obj: any): boolean {
	return typeof obj === 'undefined'
}

export function getConfig(): configType {
	if (!getWsConfig(extConfig.pageSize))
		updateWsConfig(extConfig.pageSize, defaultPageSize, true)

	// if (!getWsConfig(extConfig.curPage))
	// 	updateWsConfig(extConfig.curPage, 0, true)

	if (!getWsConfig(extConfig.lineBreak))
		updateWsConfig(extConfig.lineBreak, 'string', true)

	return {
		// curPage: getWsConfig(extConfig.curPage) as number,
		pageSize: getWsConfig(extConfig.pageSize) as number,
		lineBreak: getWsConfig(extConfig.lineBreak) as string,
	}
}

export function getBookList(context: ExtensionContext) {
	let booksString = context.globalState.get('bookList', '{}')
	return JSON.parse(booksString)
}

export function updateBookListKV(context: ExtensionContext, key: string, value: bookInfo) {
	let books = getBookList(context)
	books[key] = value
	updateBookList(context, books)
}

export function updateBookList(context: ExtensionContext, value: any) {
	context.globalState.update('bookList', JSON.stringify(value))
}

export function updateBookCur(context: ExtensionContext, book: Book) {
	updateBookListKV(context, book.fileName, {
		bookPath: book.filePath,
		curPage: book.curPage
	})
}