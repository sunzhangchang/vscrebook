import * as vscode from "vscode"
import * as fs from "fs"
import { defaultPageSize } from "../utils"
import { getConfig, getWsConfig } from "../utils/operConfig"

// TODO 实时更新txt内容

export default class Book {
	text: string = ''
	totPage: number = 0
	curPage: number = 1
	pageSize: number = defaultPageSize
	lineBreak: string = ' '
	filePath: string = ''
	fileName: string = ''

	constructor(filePath: string, curPage: number | undefined, text?: string) {
	    this.text = text ? text : ''
	    this.filePath = filePath
	    this.curPage = curPage ? curPage : 1
	    let fileNameArr: string[] = this.filePath.split('\\')
	    this.fileName = fileNameArr[fileNameArr.length - 1]
	    this.init()
	    this.refresh()
	}

	init(): void {
	    let config: ConfigType = getConfig()
	    // this.curPage = config.curPage
	    this.lineBreak = config.lineBreak
	    this.pageSize = config.pageSize
	}

	getSize(): number {
	    if (!this.text) {return 0}
	    return Math.ceil(this.text.length / this.pageSize)
	}

	getPageNumber(option: string, jumpPageNumber?: string | undefined): number {
	    let page: number = 0
	    if (option === 'prev') {
	        page = this.curPage <= 1 ? 1 : this.curPage - 1
	    } else if (option === 'next') {
	        page = this.curPage >= this.totPage  ? this.totPage : this.curPage + 1
	    } else if (option === 'jump') {
	        page = (jumpPageNumber ? (+jumpPageNumber) : this.curPage)
	    }
	    return page
	}

	getStartEnd(): [number, number] {
	    let ed: number = this.curPage * this.pageSize
	    return [ed - this.pageSize, ed]
	}

	readFile(): string {
	    let filePath = this.filePath
	    if (filePath === '' || typeof filePath === 'undefined') {return ''}
	    let data: string = fs.readFileSync(filePath, 'utf-8')
	    let lineBreak: string = getWsConfig('vscrebook.lineBreak') as string
	    let text = data.trim().replace(/[\r]+/g,'').replace(/[\t　 ]+/g, ' ').replace(/[\n]+/g, lineBreak)
	    return text
	}

	onConfigChange(): boolean {
	    let { lineBreak, pageSize} = getConfig()
	    return lineBreak !== this.lineBreak || pageSize !== this.pageSize
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
	    if (!this.text) {return ''}
	    this.curPage = this.getPageNumber(option, jumpPageNumber)
	    // updateWsConfig(ExtConfig.curPage, this.curPage, true)
	    let [st, ed] = this.getStartEnd()

	    return `${this.text.substring(st, ed)}    ${this.curPage.toString()}/${this.totPage.toString()}`
	}
}