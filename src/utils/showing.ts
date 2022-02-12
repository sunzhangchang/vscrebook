import _ = require("lodash")
import { ExtensionContext, window } from "vscode"
import Book from "../components/Book"
import { showMainMenu } from "../library"
import { getBook } from "./bookList"
import { Default, ExtConfig, getWsConfig, updateWsConfig } from "./config"
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

export function setStatusBar(msg: string) {
    window.setStatusBarMessage(msg)
}
export function showBossText() {
    let index: number = Math.floor(Math.random() * codes.length)
    setStatusBar(codes[index])
}

let bookInfoma: BookInfo | undefined
let book: Book | undefined

export function startt(context: ExtensionContext) {
    showMainMenu(context).then(res => {
        bookInfoma = res
        if (_.isUndefined(bookInfoma)) {
            book = undefined
            return
        }
        book = new Book(bookInfoma.bookPath)
        book.getPageText('jump').then(res => {
            setStatusBar(res)
        })
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
        book.getPageText('jump', val).then(res => {
            setStatusBar(res)
            clearShowBossInterval()
        })
    })
}

export function showPrev() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    book.getPageText('prev').then(res => {
        setStatusBar(res)
    })
}

export function showNext() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    book.getPageText('next').then(res => {
        setStatusBar(res)
    })
}

let autoFlipping: NodeJS.Timeout | null = null
let showBossInterval: NodeJS.Timeout | null = null

export function clearShowBossInterval() {
    if (!_.isNull(showBossInterval)) {
        clearInterval(showBossInterval)
        showBossInterval = null
    }
}

export function setShowBossInterval() {
    showBossInterval = setInterval(() => showBossText(), 30 * 1000)
}

export function clearAutoFlipInterval() {
    if (!_.isNull(autoFlipping)) {
        clearInterval(autoFlipping)
        autoFlipping = null
        console.log(autoFlipping)
        window.showInformationMessage('停止自动翻页')
    }
}

export function setAutoFlipInterval() {
    autoFlipping = setInterval(() => showNext(), getWsConfig(ExtConfig.autoFlipTime) as number)
}

let isBoss: boolean = false

export function toggleBossMsg() {
    if (_.isUndefined(book)) {
        isBoss = true
        showBossText()
        return
    }
    if (isBoss) {
        book.getPageText('jump').then(res => {
            setStatusBar(res)
        })
        isBoss = false
        clearShowBossInterval()
        if (!_.isNull(autoFlipping)) {
            clearShowBossInterval()
        } else {
            setShowBossInterval()
        }
    } else {
        clearAutoFlipInterval()
        showBossText()
        isBoss = true
    }
}

export function autoFlipp() {
    if (_.isUndefined(book)) {
        error(Errors.bookUndefined)
        return
    }
    if (_.isUndefined(getWsConfig(ExtConfig.autoFlipTime))) {
        updateWsConfig(ExtConfig.autoFlipTime, Default.autoFlipTime)
    }
    if (isBoss) {
        clearAutoFlipInterval()
        return
    }
    if (!_.isNull(autoFlipping)) {
        clearAutoFlipInterval()
        return
    } else {
        window.showInformationMessage(`开始自动翻页! 当前设置: 每 ${getWsConfig(ExtConfig.autoFlipTime) as number} 毫秒(ms)翻页!`)
        setAutoFlipInterval()
    }
}
