import _ = require("lodash")
import { ExtensionContext, window } from "vscode"
import Book from "../components/Book"
import { showMainMenu } from "../library"
import { getBook } from "./bookList"
import { getConfig } from "./config"
import { error, Errors } from "./error"

const codes: string[] = [
    'Java - System.out.println("Hello World");',
    'Scala - println("Hello, world!")',
    'Kotlin - println("Hello, world!")',
    'Groovy - println "Hello, world!"',
    'C - printf("Hello, World!");',
    'C# - System.Console.WriteLine("Hello World!"); ',
    'C++ - cout << "Hello, world!" << endl;',
    'Python - print("Hello, World!")',
    'PHP - echo "Hello World!";',
    'Ruby - puts "Hello World!";',
    'Rust - println!("Hello, World!");',
    'Perl - print "Hello, World!";',
    'Lua - print("Hello World!")',
    'Golang - fmt.Println("Hello, World!")',
    'JavaScript - console.log("Hello, World!")',
    'TypeScript - console.log("Hello, World!")',
    'ReScript - Js.log("Hello, World!")',
    'PureScript - log "Hello, World!"',
    'Scala.js - printl("Hello, World!")',
]

let bookInfoma: BookInfo | undefined
let book: Book | undefined

let autoFlipping: NodeJS.Timeout | null = null
let showBossInterval: NodeJS.Timeout | null = null

let isBoss: boolean = false

export function setShowBossInterval() {
    showBossInterval = setInterval(() => {
        showBossText()
        clearShowBossInterval()
    }, 25 * 1000)
}

export function clearShowBossInterval() {
    if (!_.isNull(showBossInterval)) {
        clearInterval(showBossInterval)
        showBossInterval = null
    }
}

export function setAutoFlipInterval() {
    clearShowBossInterval()
    autoFlipping = setInterval(() => showNext(), getConfig().autoFlipTime)
}

export function clearAutoFlipInterval() {
    if (!_.isNull(autoFlipping)) {
        clearInterval(autoFlipping)
        autoFlipping = null
        window.showInformationMessage('停止自动翻页')
    }
}

export function showNovelText(page?: number) {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    setStatusBar(book.getPageText(page))
    isBoss = false
}

export function setStatusBar(msg: string) {
    window.setStatusBarMessage(msg)
}

export function showBossText() {
    let index: number = Math.floor(Math.random() * codes.length)
    setStatusBar(codes[index])
    isBoss = true
}

export function startt(context: ExtensionContext) {
    showMainMenu(context).then(res => {
        bookInfoma = res
        if (_.isUndefined(bookInfoma)) {
            book = undefined
            return
        }
        book = new Book(bookInfoma.bookPath)
        showNovelText()
    })
}

export function showJump() {
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
        showNovelText(_.isUndefined(val) ? undefined : (+val))
        clearShowBossInterval()
        setShowBossInterval()
    })
}

export function showPrev() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    showNovelText(getBook(book.name).curPage - 1)
}

export function showNext() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    showNovelText(getBook(book.name).curPage + 1)
}

export function toggleBossMsg() {
    if (_.isUndefined(book)) {
        isBoss = true
        showBossText()
        return
    }
    if (isBoss) {
        showNovelText()
        isBoss = false
        clearShowBossInterval()
        if (!_.isNull(autoFlipping)) {
            clearShowBossInterval()
        } else {
            setShowBossInterval()
        }
    } else {
        clearAutoFlipInterval()
        clearShowBossInterval()
        showBossText()
        isBoss = true
    }
}

export function autoFlipp() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    if (isBoss) {
        clearAutoFlipInterval()
        return
    }
    if (!_.isNull(autoFlipping)) {
        clearAutoFlipInterval()
        setShowBossInterval()
        return
    } else {
        window.showInformationMessage(`开始自动翻页! 当前设置: 每 ${getConfig().autoFlipTime} 毫秒(ms)翻页!`)
        setAutoFlipInterval()
    }
}
