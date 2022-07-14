import { writeFileSync } from "fs"
import _ = require("lodash")
import { join, parse } from "path"
import { window } from "vscode"
import { myerror, Errors } from "../utils/error"
import axios from 'axios'
import { USER_AGENT } from "./utils"
import { Caimoge } from "./sub/caimoge"
import { Crawl } from "./Crawl"
import { setExtTo } from "../utils"
import { Wbxsw } from "./sub/wbxsw"
import { Aixiashu } from "./sub/aixiashu"
import { AnyNode, Cheerio, CheerioAPI, Element, load } from "cheerio"
import axiosRetry from "axios-retry"
import { getConfig } from "../core/config"

axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

axiosRetry(axios, {
    retries: 3,
})

const crawlers: Crawl[] = [
    new Caimoge(),
    new Wbxsw(),
    new Aixiashu(),
]

export async function search(searchKey: string): Promise<SearchBook[]> {
    let list: SearchBook[] = []
    for (const iter of crawlers) {
        list = _.concat(list, (await iter.search(searchKey)) ?? [])
    }
    return list
}

export async function download(source: string, menuURL: string, dir: string, name: string): Promise<string> {
    const spider = crawlers.find(iter => _.isEqual(iter.sourceName, source))

    if (_.isUndefined(spider)) {
        myerror(Errors.downloadNovelFailed)
        throw new Error(`${source} cannot find crawl!`)
    }

    const data = await spider.download(menuURL)

    if (_.isNull(data)) {
        myerror(Errors.downloadNovelFailed)
        throw new Error(`${menuURL} cannot fetch anything!`)
    }

    return (() => {
        const pth = join(dir, setExtTo(parse(name).name, 'txt'))
        writeFileSync(pth, data, {
            encoding: "utf8"
        })
        window.showInformationMessage('下载完成!')
        return pth
    })()
}

// eslint-disable-next-line no-useless-escape
const indexReg = /PART\b|^Prologue|Chapter\s*[-_]?\d+|分卷|^序$|^序\s*言|^序\s*章|^前\s*言|^附\s*[录錄]|^引\s*[言子]|^摘\s*要|^[楔契]\s*子|^后\s*记|^後\s*記|^附\s*言|^结\s*语|^結\s*語|^尾\s*[声聲]|^最終話|^最终话|^番\s*外|^\d+\s*\D*[^\d#\.]$|^[第（]?[\d〇零一二三四五六七八九十百千万萬-]+\s*[、）章节節回卷折篇幕集话話]/i
const innerNextPage = /下一[页頁张張]|next\s*page|次のページ/i

type Ele = {
    href: string
    text: string
}

async function fetch(url: string): Promise<void> {
    const response = await axios.get(url)
    const $ = load(Buffer.from(response.data).toString('utf8'))
    const aeles = $('a:not(#search-jumper a)'), list: Ele[] = []
    for (let i = 0; i < aeles.length; i++) {
        let has = false
        const a = $(aeles[i])
        const t = a.attr('href')
        let at: Ele = {
            href: '',
            text: ''
        }
        if ((_.isUndefined(t) || t?.indexOf('javascript') !== -1) && a.data()['href']) {
            at.href = a.data()['href'] as string
        } else if (!_.isUndefined(t)) {
            at.href = t
        }
        at.text = a.text()
        for (let j = 0; j < list.length; j++) {
            if (_.isEqual(list[j].href, at.href)) {
                at = list[j]
                list.splice(j, 1)
                list.push(at)
                has = true
                break
            }
        }
        if (!has && at.href && /^http/i.test(at.href) && (at.text.trim() !== '' && indexReg.test(at.text.trim())) || /chapter[-_]?\d/.test(at.href)) {
            list.push(at)
        }
    }
    if (list.length > 2) {
        indexDownload(list)
    }
}

let rCats: (string | null)[] = []
let curRequests: {
    curIndex: number;
    get: Promise<void>;
    href: string;
}[] = []

function getNextPage($: CheerioAPI): Ele | null {
    const list = $('a')
    for(const ele of list) {
        const e = $(ele)
        const res: Ele = {
            href: e.attr('href') ?? '',
            text: e.text(),
        }
        if (innerNextPage.test(res.text) && !_.isEmpty(res.href) && res.href.indexOf('javascript') === -1) {
            return res
        }
    }
    return null
}

function getPageContent(doc: CheerioAPI): string {
    const $ = load(doc('body').text().replaceAll(/<!--((.|[\n|\r|\r\n])*?)-->/g, ''))
    $('font.jammer').remove()
    // todo: remove ads
    $('script,style,link,img,noscript,iframe').remove()
    $('span,div,ul').each((i, e) => {
        const ele = $(e)
        if (ele.css()) {
            if (_.isEqual(ele.css('display'), 'none') || (ele.is('span') && _.isEqual(ele.css('font-size'), '0px'))) {
                ele.remove()
            }
        }
    })

    let maxNum = 0, maxContent: Element | undefined
    const contents = $('span,div,article,p,td')
    for (const e of contents) {
        const ele = $(e)
        let hasText = false, allSingle = true
        for (const childe of e.childNodes) {
            if (childe.nodeType === 3) {
                if (/^\s*$/.test(childe.data)) {
                    $(childe).remove()
                } else {
                    hasText = true
                }
            } else {
                if ($(childe).is('i,a,string,b,font,p,dl,dd,h')) {
                    hasText = true
                }
            }
        }
        // const children = ele.children()
        // for (const childe of children) {
        //     const child = $(childe)
        //     if (childe.nodeType) {
        //     }
        // }

        for (const childe of e.childNodes) {
            if (childe.nodeType === 1 && $(childe).is('i,a,strong,b,font,be') && /^[\s\-_?>|]*$/.test($(childe).text())) {
                $(childe).remove()
            }
        }

        if (e.childNodes.length > 1) {
            for (const childe of e.childNodes) {
                if (childe.nodeType === 1) {
                    for (const ce of $(childe).children()) {
                        if (!$(ce).is('i,a,strong,b,font,br')) {
                            allSingle = false
                            break
                        }
                    }
                    if (!allSingle) {
                        break
                    }
                }
            }
        } else {
            allSingle = false
        }

        let curNum = 0
        if (allSingle) {
            curNum = ele.text().length
        } else {
            if (!hasText) {
                continue
            }
            for (const childe of e.childNodes) {
                if (childe.nodeType === 3) {
                    curNum += childe.data.length
                } else if ($(childe).is('i,a,strong,b,font,p,dl,dd,h')) {
                    curNum += $(childe).text().length
                }
            }
        }
        if (curNum > maxNum) {
            maxNum = curNum
            maxContent = e
        }
    }
    if (_.isUndefined(maxContent)) {
        return 'error: no text content'
    }

    function getDepth(e: Cheerio<AnyNode>): number {
        return getDepth($(e).parent()) + 1
    }

    const dep = getDepth($(maxContent))

    function getRightStr(e: Element, noTextEnable: boolean): void {
        let hasText = false
        let cstr = '\r\n'
        for (const ce of e.childNodes) {
            if (ce.nodeType === 3 && ce.data && !/^[\s\-_?>|]*$/.test(ce.data)) {
                hasText = true
            }
            let text = $(ce).text()
            if (text) {
                text = text.replaceAll(/<\s*br\s*>/gi, '\r\n').replaceAll(/\n+/gi, '\n').replaceAll(/\r+/gi, '\r')
            }
            if ($(ce).con)
        }
        let childNodes=ele.childNodes,cStr="\r\n",hasText=false;
        for(let j=0;j<childNodes.length;j++){
            let childNode=childNodes[j];
            if(childNode.nodeType==3 && childNode.data && !/^[\s\-\_\?\>\|]*$/.test(childNode.data))hasText=true;
            if(childNode.innerHTML){
                childNode.innerHTML=childNode.innerHTML.replace(/\<\s*br\s*\>/gi,"\r\n").replace(/\n+/gi,"\n").replace(/\r+/gi,"\r");
            }
            if(childNode.textContent){
                cStr+=childNode.textContent.replace(/ +/g,"  ").replace(/([^\r]|^)\n([^\r]|$)/gi,"$1\r\n$2");
            }
            if(childNode.nodeType!=3 && !/^(I|A|STRONG|B|FONT)$/.test(childNode.tagName))cStr+="\r\n";
        }
        if(hasText || noTextEnable || ele==maxContent)rStr+=cStr+"\r\n";
    }

    const list = $(maxContent.tagName) as Cheerio<Element>
    for (const e of list) {
        const ele = $(e)
        if (getDepth(ele) === dep) {
            if ((!maxContent.attribs.class && e.attribs.class) || (maxContent.attribs.class && !e.attribs.class) || (maxContent.attribs.class === e.attribs.class)) {
                continue
            }
            if((maxContent.attribs.class && maxContent.attribs.class === e.attribs.class) || maxContent.parentNode === e.parentNode) {
                getRightStr(e, true)
            }else {
                getRightStr(e, false)
            }
        }
    }

    for(i=0;i<childlist.length;i++){
        var child=childlist[i];
        if(getDepth(child)==getDepth(maxContent)){
            if((!maxContent.attribs.class && child.attribs.class) || (maxContent.attribs.class && !child.attribs.class) || (maxContent.attribs.class && child.attribs.class && maxContent.attribs.class != child.attribs.class))continue;
            if((maxContent.attribs.class && maxContent.attribs.class==child.attribs.class)||maxContent.parentNode ==child.parentNode){
                getRightStr(child, true);
            }else {
                getRightStr(child, false);
            }
        }
    }
    return rStr.replace(/[\n\r]+/g,"\n\r");
}

function indexDownload(aeles: Ele[]) {
    if (aeles.length < 1) {
        return
    }
    rCats = []
    const insertSigns: number[][] = []
    let downIndex = 0, downNum = 0

    const processDoc = (i: number, aTag: Ele, $: CheerioAPI, cause?: string) => {
        const func = content => {
            rCats[i] = (aTag.text.trim() + '\r\n' + content + (cause || ''))
            curRequests = curRequests.filter(e => e.curIndex !== i)
            window.showInformationMessage('正在下载:')
            txtDownContent.style.display = "block"
            txtDownWords.innerHTML = getI18n("downloading", [downNum, (aEles.length - downNum), aTag.innerText]);
            if (downNum == aEles.length) {
                txtDownWords.innerHTML = getI18n("complete", [downNum]);
                sortInnerPage();
                var blob = new Blob([i18n.info + "\r\n\r\n" + document.title + "\r\n\r\n" + rCats.join("\r\n\r\n")], { type: "text/plain;charset=utf-8" });
                saveAs(blob, document.title + ".txt");
            }
        }

        let contentRes = getPageContent($, content => {
            func(content)
        })
        if (contentResult !== false) {
            func(contentResult);
        }
    }

    const downOnce = () => {
        if (downNum >= aeles.length) {
            return
        }
        const curIndex = downIndex
        let aTag = aeles[curIndex]
        const request = (aTag: Ele, curIndex: number) => {
            const get = axios({
                method: 'get',
                url: aTag.href,
                timeout: 15000,
                responseEncoding: 'utf8',
            }).then(res => {
                const data = Buffer.from(res.data).toString('utf-8')
                downIndex ++
                downNum ++
                const $ = load(data)
                const nextPage = getNextPage($)

                if (!_.isNull(nextPage)) {
                    const inArr = aeles.findIndex(e => e.href === nextPage.href) !== -1
                    if (!inArr) {
                        nextPage.text = aTag.text + '\t>>'
                        aeles.push(nextPage)
                        let targetIndex = curIndex
                        for (const [i, signs] of insertSigns.entries()) {
                            let flg = true
                            for (const sig of signs) {
                                if (sig === curIndex) {
                                    targetIndex = i
                                    flg = true
                                    break
                                }
                            }
                            if (flg) {
                                break
                            }
                        }
                        for (let k = insertSigns.length; k <= targetIndex; k++) {
                            insertSigns.push([])
                        }
                        insertSigns[targetIndex].push(aeles.length - 1)
                    }
                }
                processDoc(curIndex, aTag, $)
                const req = downOnce()
                if (req) {
                    curRequests.push(req)
                }
            }).catch(e => {
                console.warn("error:")
                console.log(e)
                downIndex++
                downNum++
                processDoc(curIndex, aTag, null, ' : NETWORK ERROR ' + (e.response || e.responseText))
                const req = downOnce()
                if (req) {
                    curRequests.push(req)
                }
            })
            return {curIndex, get, href: aTag.href}
        }
        if (!aTag) {
            const waitAtagReadyInterval = setInterval(() => {
                if (downNum > aeles.length) {
                    clearInterval(waitAtagReadyInterval)
                }
                aTag = aeles[curIndex]
                if (aTag) {
                    clearInterval(waitAtagReadyInterval)
                    request(aTag, curIndex)
                }
            }, 1000)
            return null
        }
        return request(aTag, curIndex)
    }

    function sortInnerPage() {
        var pageArrs = [], maxIndex = 0, i, j;
        for (i = 0; i < insertSigns.length; i++) {
            var signs = insertSigns[i];
            if (signs) {
                for (j = 0; j < signs.length; j++) {
                    var sign = signs[j];
                    var cat = rCats[sign];
                    rCats[sign] = null;
                    if (!pageArrs[i]) pageArrs[i] = [];
                    pageArrs[i].push(cat);
                }
            }
        }
        for (i = pageArrs.length - 1; i >= 0; i--) {
            let pageArr = pageArrs[i];
            if (pageArr) {
                for (j = pageArr.length - 1; j >= 0; j--) {
                    rCats.splice(i + 1, 0, pageArr[j]);
                }
            }
        }
        rCats = rCats.filter(function (e) { return e != null });
    }
    let downThreadAmount = getConfig().downThreadAmount
    downThreadAmount = downThreadAmount > 0 ? downThreadAmount : 20
    for(let i = 0; i < downThreadAmount; i++) {
        const req = downOnce()
        if (req) {
            curRequests.push(req)
        }
        if (downIndex >= aeles.length - 1 || downIndex >= downThreadAmount - 1) {
            break
        } else {
            downIndex++
        }
    }
}
