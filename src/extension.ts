import { window, ExtensionContext, commands } from "vscode"
import Book from './components/Book'
import * as Library from './components/Library'
import { updateBookCur } from './utils/operBookList'
import { setStatusBar, toggleBossMsg } from "./utils/operStatusBar"

const extName = 'vscrebook'

export function activate(context: ExtensionContext) {

    console.log(`Congratulations, your extension "${extName}" is now active!`)

    let bookInfoma: BookInfo | undefined
    let book: Book

    let start = commands.registerCommand(`${extName}.start`, () => {
        Library.action(context).then(bp => {
            bookInfoma = bp
            if (!bookInfoma) { return }
            book = new Book(bookInfoma.bookPath, bookInfoma.curPage)
            setStatusBar(book.getPageText('jump'))
        })
    })
    context.subscriptions.push(start)

    // 老板键，弹出调试模式运行，运行失败并，将小说替换成 Hello, World 代码
    let displayCode = commands.registerCommand(`${extName}.displayCode`, () => {
        toggleBossMsg()
    })
    context.subscriptions.push(displayCode)

    // 下一页
    let nextPage = commands.registerCommand(`${extName}.nextPage`, () => {
        setStatusBar(book.getPageText('next'))
        updateBookCur(context, book)
    })
    context.subscriptions.push(nextPage)

    // 上一页
    let prevPage = commands.registerCommand(`${extName}.prevPage`, () => {
        setStatusBar(book.getPageText('prev'))
        updateBookCur(context, book)
    })
    context.subscriptions.push(prevPage)

    // 跳转
    let jumpPage = commands.registerCommand(`${extName}.jumpPage`, () => {
        const option = {
            prompt: '请输入跳转页数: ',
            placeHolder: `跳转页数(默认跳转到当前页: ${book.curPage})`
        }
        window.showInputBox(option).then(val => {
            setStatusBar(book.getPageText('jump', val))
            updateBookCur(context, book)
        })
    })
    context.subscriptions.push(jumpPage)
}

export function deactivate() {}
