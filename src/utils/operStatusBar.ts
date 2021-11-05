import { window } from "vscode"

let isBossText: boolean = false

let lastText: string = ''

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
    'Perl - print "Hello, World!";',
    'Lua - print("Hello World!")',
    'Golang - fmt.Println("Hello, World!")',
    'JavaScript - console.log("Hello, World!")',
    'TypeScript - console.log("Hello, World!")',
    'ReScript - Js.log("Hello, World!")',
    'PureScript - log "Hello, World!"',
    'Scala.js - printl("Hello, World!")',
]

function _setStatusBar(msg: string) {
    window.setStatusBarMessage(msg)
}

function showBossText() {
    isBossText = true
    let index: number = Math.floor(Math.random() * codes.length)
    _setStatusBar(codes[index])

    window.showInformationMessage('Run with debug mode!')
    setTimeout(() => window.showErrorMessage('Run code failed!'), 1500)
}

function showNovelText() {
    isBossText = false
    _setStatusBar(lastText)
}

export function toggleBossMsg() {
    if (isBossText) {
        showNovelText()
    } else {
        showBossText()
    }
}

export function setStatusBar(msg: string) {
    lastText = msg
    showNovelText()
}