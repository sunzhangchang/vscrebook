import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "vscrebook" is now active!')

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
	let redisplayCode = vscode.commands.registerCommand('vscrebook.redisplayCode', () => {
		let index: number = Math.floor(Math.random() * languageHelloWorld.length)
		vscode.window.setStatusBarMessage(languageHelloWorld[index])

		vscode.window.showInformationMessage('Run with debug mode!')
		setTimeout(() => vscode.window.showErrorMessage('Run code failed!'), 1500)
	})

	context.subscriptions.push(redisplayCode)
}

export function deactivate() {}
