import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from "fs"
import { decode, encode } from 'iconv-lite'
import { ExtensionContext, workspace } from 'vscode'
import Book from '../components/Book'

export const defaultPageSize = 25

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export const enum ExtConfig {
	pageSize = 'vscrebook.pageSize',
	lineBreak = 'vscrebook.lineBreak',
}

export function detect(filePath: string) {
    let decod = detectFileSync(filePath, { sampleSize: 128 })
    if (!decod) {
        throw new Error('当前编码不支持')
    }
    return decod.toString()
}

export function copyFileToUTF8Sync(oldPath: string, newPath: string, transform: (data: string) => string) {
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

export function getConfig(): ConfigType {
    if (!getWsConfig(ExtConfig.pageSize)) {
        updateWsConfig(ExtConfig.pageSize, defaultPageSize, true)
    }

    // if (!getWsConfig(ExtConfig.curPage))
    // 	updateWsConfig(ExtConfig.curPage, 0, true)

    if (!getWsConfig(ExtConfig.lineBreak)) {
        updateWsConfig(ExtConfig.lineBreak, 'string', true)
    }

    return {
        // curPage: getWsConfig(ExtConfig.curPage) as number,
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        lineBreak: getWsConfig(ExtConfig.lineBreak) as string,
    }
}

export function getBookList(context: ExtensionContext) {
    let booksString = context.globalState.get('bookList', '{}')
    return JSON.parse(booksString)
}

export function updateBookListKV(context: ExtensionContext, key: string, value: BookInfo) {
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