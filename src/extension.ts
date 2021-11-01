import * as vscode from 'vscode'
import Book, { bookconfig } from './lib/Book'

const extName = 'vscrebook'

export function activate(context: vscode.ExtensionContext) {
	
	console.log(`Congratulations, your extension "${extName}" is now active!`)

	let languageHelloWorld: string[] = [
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

	// 老板键，弹出调试模式运行，运行失败并，将小说替换成 Hello, World 代码
	let displayCode = vscode.commands.registerCommand(`${extName}.displayCode`, () => {
		let index: number = Math.floor(Math.random() * languageHelloWorld.length)
		vscode.window.setStatusBarMessage(languageHelloWorld[index])

		vscode.window.showInformationMessage('Run with debug mode!')
		setTimeout(() => vscode.window.showErrorMessage('Run code failed!'), 1500)
	})
	context.subscriptions.push(displayCode)

	let book: Book = new Book(context)

	// 下一页
	let nextPage = vscode.commands.registerCommand(`${extName}.nextPage`, () => {
		vscode.window.setStatusBarMessage(book.getPageText('next'))
	})
	context.subscriptions.push(nextPage)

	// 上一页
	let prevPage = vscode.commands.registerCommand(`${extName}.prevPage`, () => {
		vscode.window.setStatusBarMessage(book.getPageText('prev'))
	})
	context.subscriptions.push(prevPage)

	// 跳转
	let jumpPage = vscode.commands.registerCommand(`${extName}.jumpPage`, () => {
		const option = {
			prompt: '请输入跳转页数: ',
			placeHolder: `跳转页数(默认跳转到当前页: ${vscode.workspace.getConfiguration().get(bookconfig.curPage)})`
		}
		vscode.window.showInputBox(option).then(val => {
			vscode.window.setStatusBarMessage(book.getPageText('jump', val))
		})
	})
	context.subscriptions.push(jumpPage)

	// 刷新
	let refresh = vscode.commands.registerCommand(`${extName}.refresh`, () => {
		book.refresh()
	})
	context.subscriptions.push(refresh)
}

export function deactivate() {}
