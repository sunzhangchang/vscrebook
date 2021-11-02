import * as vscode from "vscode"
import * as fs from "fs"

const defaultPageSize = 25

const vscconfig = vscode.workspace.getConfiguration

export enum bookconfig {
	curPage = 'vscrebook.curPageNumber',
	pageSize = 'vscrebook.pageSize',
	lineBreak = 'vscrebook.lineBreak',
	filePath = 'vscrebook.filePath',
}

export default class Book {
	text: string = ''
	totPage: number = 0
	curPage: number = 0
	pageSize: number = defaultPageSize
	lineBreak: string = ' '
	filePath: string | undefined = undefined
	context: vscode.ExtensionContext

	constructor(extensionContext: vscode.ExtensionContext) {
		this.context = extensionContext
		this.init()
		this.refresh()
	}

	init(): void {
		let config: configType = this.getConfig()
		this.curPage = config.curPage
		this.filePath = config.filePath
		this.lineBreak = config.lineBreak
		this.pageSize = config.pageSize
	}

	getSize(): number {
		return Math.ceil(this.text.length / this.pageSize)
	}

	getFileName(): string | undefined {
		let filePath = this.filePath
		if (typeof filePath === 'undefined') {
			return undefined
		}
		let fileNameArr: string[] = filePath.split('/')
		let fileName: string = fileNameArr[fileNameArr.length - 1]
		console.log(fileName);
		return fileName
	}

	getPageNumber(option: string, jumpPageNumber?: string | undefined): number {
		let curPage: number = vscconfig().get(bookconfig.curPage) as number
		let page: number = 0
		if (option === 'prev') {
			page = curPage <= 1 ? 1 : curPage - 1
		} else if (option === 'next') {
			page = curPage >= this.totPage  ? this.totPage : curPage + 1
		} else if (option === 'jump') {
			page = (jumpPageNumber ? (+jumpPageNumber) : curPage)
		}
		return page
	}

	getStartEnd(): [number, number] {
		let ed: number = this.curPage * this.pageSize
		return [ed - this.pageSize, ed]
	}

	readFile(): string {
		let filePath = this.filePath
		if (filePath === '' || typeof filePath === 'undefined') {
			vscode.window.showWarningMessage('请填写TXT格式的小说文件路径 & Please fill in the path of the TXT format novel file')
			return ''
		}
		let data: string = fs.readFileSync(filePath, 'utf-8')
		let lineBreak: string = vscconfig().get('vscrebook.lineBreak') as string
		let text = data.replace(/[\r]+/g,'').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak)
		return text
	}

	getConfig(): configType {
		if (typeof vscconfig().get(bookconfig.pageSize) === 'undefined') {
			vscconfig().update(bookconfig.pageSize, defaultPageSize, true)
		}
		if (typeof vscconfig().get(bookconfig.curPage) === 'undefined') {
			vscconfig().update(bookconfig.curPage, 0, true)
		}
		if (typeof vscconfig().get(bookconfig.lineBreak) === 'undefined') {
			vscconfig().update(bookconfig.lineBreak, 'string', true)
		}
		return {
			curPage: vscconfig().get(bookconfig.curPage) as number,
			pageSize: vscconfig().get(bookconfig.pageSize) as number,
			lineBreak: vscconfig().get(bookconfig.lineBreak) as string,
			filePath: vscconfig().get(bookconfig.filePath)
		}
	}

	onConfigChange(): boolean {
		let {curPage, filePath, lineBreak, pageSize} = this.getConfig()
		return curPage !== this.curPage || filePath !== this.filePath || lineBreak !== this.lineBreak || pageSize !== this.pageSize
	}

	refresh() {
		this.init()
		this.text = this.readFile()
		this.totPage = this.getSize()
		vscode.window.setStatusBarMessage(this.text)
	}

	getPageText(option: string, jumpPageNumber?: string | undefined): string {
		if (this.onConfigChange()) {
			this.refresh()
		}
		this.curPage = this.getPageNumber(option, jumpPageNumber)
		vscconfig().update(bookconfig.curPage, this.curPage, true)
		let [st, ed] = this.getStartEnd()
		return `${this.text.substring(st, ed)}    ${this.curPage.toString()}/${this.totPage.toString()}`
	}
}