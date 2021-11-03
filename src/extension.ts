import { window, ExtensionContext, commands } from "vscode"
import Book from './lib/Book'
import * as Library from './lib/Library'
import { updateBookList, updateBookCur } from './lib/utils'


const extName = 'vscrebook'

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


export function activate(context: ExtensionContext) {

	console.log(`Congratulations, your extension "${extName}" is now active!`)

	let bookInfoma: bookInfo | undefined
	let book: Book

	let start = commands.registerCommand(`${extName}.start`, () => {
		Library.action(context).then(bp => {
			bookInfoma = bp
			if (!bookInfoma) return
			book = new Book(bookInfoma.bookPath, bookInfoma.curPage)
			window.setStatusBarMessage(book.getPageText('jump'))
		})
	})
	context.subscriptions.push(start)

	// 老板键，弹出调试模式运行，运行失败并，将小说替换成 Hello, World 代码
	let displayCode = commands.registerCommand(`${extName}.displayCode`, () => {
		let index: number = Math.floor(Math.random() * codes.length)
		window.setStatusBarMessage(codes[index])
	
		window.showInformationMessage('Run with debug mode!')
		setTimeout(() => window.showErrorMessage('Run code failed!'), 1500)
	})
	context.subscriptions.push(displayCode)

	// 下一页
	let nextPage = commands.registerCommand(`${extName}.nextPage`, () => {
		window.setStatusBarMessage(book.getPageText('next'))
		updateBookCur(context, book)
	})
	context.subscriptions.push(nextPage)

	// 上一页
	let prevPage = commands.registerCommand(`${extName}.prevPage`, () => {
		window.setStatusBarMessage(book.getPageText('prev'))
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
			window.setStatusBarMessage(book.getPageText('jump', val))
			updateBookCur(context, book)
		})
	})
	context.subscriptions.push(jumpPage)
}

export function deactivate() {}
