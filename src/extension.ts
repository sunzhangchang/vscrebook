import { window, ExtensionContext, commands } from "vscode"
import Book from './components/Book'
import * as Library from './components/Library'
import { error, Errors } from "./utils/error"
import { bookListInit, getBook } from './utils/bookList'
import { setStatusBar, toggleBossMsg } from "./utils/statusBar"
import _ = require("lodash")

const extName = 'vscrebook'

export function activate(context: ExtensionContext) {

    bookListInit(context)

    console.log(`Congratulations, your extension "${extName}" is now active!`)

    let bookInfoma: BookInfo | undefined
    let book: Book | undefined

    let start = commands.registerCommand(`${extName}.start`, () => {
        Library.action(context).then(res => {
            bookInfoma = res
            if (_.isUndefined(bookInfoma)) {
                book = undefined
                return
            }
            book = new Book(bookInfoma.bookPath)
            setStatusBar(book.getPageText('jump'))
        })
    })
    context.subscriptions.push(start)

    // 老板键，将小说替换成 Hello, World 代码
    let bossKey = commands.registerCommand(`${extName}.bossKey`, () => {
        toggleBossMsg(_.isUndefined(book))
    })
    context.subscriptions.push(bossKey)

    // 下一页
    let nextPage = commands.registerCommand(`${extName}.nextPage`, () => {
        if (_.isUndefined(book)) {
            return
        }
        setStatusBar(book.getPageText('next'))
    })
    context.subscriptions.push(nextPage)

    // 上一页
    let prevPage = commands.registerCommand(`${extName}.prevPage`, () => {
        if (_.isUndefined(book)) {
            error(Errors.bookUndefined)
            return
        }
        setStatusBar(book.getPageText('prev'))
    })
    context.subscriptions.push(prevPage)

    // 跳转
    let jumpPage = commands.registerCommand(`${extName}.jumpPage`, () => {
        if (_.isUndefined(book)) {
            error(Errors.bookUndefined)
            return
        }
        window.showInputBox({
            prompt: '请输入跳转页数: ',
            placeHolder: `跳转页数(默认跳转到当前页: ${getBook(book.name).curPage})`
        }).then(val => {
            if (_.isUndefined(book)) {
                error(Errors.bookUndefined)
                return
            }
            setStatusBar(book.getPageText('jump', val))
        })
    })
    context.subscriptions.push(jumpPage)
}

export function deactivate() { }
