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
import { Cheerio, Element, load } from "cheerio"

axios.defaults.headers.common['User-Agent'] = USER_AGENT
axios.defaults.responseType = 'arraybuffer'

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

const indexReg = /PART\b|^Prologue|Chapter\s*[\-_]?\d+|分卷|^序$|^序\s*言|^序\s*章|^前\s*言|^附\s*[录錄]|^引\s*[言子]|^摘\s*要|^[楔契]\s*子|^后\s*记|^後\s*記|^附\s*言|^结\s*语|^結\s*語|^尾\s*[声聲]|^最終話|^最终话|^番\s*外|^\d+\s*\D*[^\d#\.]$|^[第（]?[\d〇零一二三四五六七八九十百千万萬-]+\s*[、）章节節回卷折篇幕集话話]/i;

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

function indexDownload(aeles: Ele[]) {
    if (aeles.length < 1) {
        return
    }
    rCats = [];
    var insertSigns = [];
    // var j=0,rCats=[];
    var downIndex = 0, downNum = 0, downOnce = function () {
        if (downNum >= aEles.length) return;
        let curIndex = downIndex;
        let aTag = aEles[curIndex];
        let request = (aTag, curIndex) => {
            let tryTimes = 0;
            let requestBody = {
                method: 'GET',
                url: aTag.href,
                headers: {
                    referer: aTag.href,
                    "Content-Type": "text/html;charset=" + document.charset,
                },
                timeout: 15000,
                overrideMimeType: "text/html;charset=" + document.charset,
                onload: function (result) {
                    downIndex++;
                    downNum++;
                    var doc = getDocEle(result.responseText);
                    let nextPage = checkNextPage(doc);
                    if (nextPage) {
                        var inArr = false;
                        for (var ai = 0; ai < aEles.length; ai++) {
                            if (aEles[ai].href == nextPage.href) {
                                inArr = true;
                                break;
                            }
                        }
                        if (!inArr) {
                            nextPage.innerText = aTag.innerText + "\t>>";
                            aEles.push(nextPage);
                            let targetIndex = curIndex;
                            for (let a = 0; a < insertSigns.length; a++) {
                                let signs = insertSigns[a], breakSign = false;
                                if (signs) {
                                    for (let b = 0; b < signs.length; b++) {
                                        let sign = signs[b];
                                        if (sign == curIndex) {
                                            targetIndex = a;
                                            breakSign = true;
                                            break;
                                        }
                                    }
                                }
                                if (breakSign) break;
                            }
                            let insertSign = insertSigns[targetIndex];
                            if (!insertSign) insertSigns[targetIndex] = [];
                            insertSigns[targetIndex].push(aEles.length - 1);
                        }
                    }
                    processDoc(curIndex, aTag, doc);
                    let request = downOnce();
                    if (request) curRequests.push(request);
                },
                onerror: function (e) {
                    console.warn("error:");
                    console.log(e);
                    downIndex++;
                    downNum++;
                    processDoc(curIndex, aTag, null, ' : NETWORK ERROR ' + (e.response || e.responseText));
                    let request = downOnce();
                    if (request) curRequests.push(request);
                },
                ontimeout: function (e) {
                    console.warn("timeout: times=" + tryTimes + " url=" + aTag.href);
                    //console.log(e);
                    if (++tryTimes < 3) {
                        return GM_xmlhttpRequest(requestBody);
                    }
                    downIndex++;
                    downNum++;
                    processDoc(curIndex, aTag, null, ' : TIMEOUT ' + aTag.href);
                    let request = downOnce();
                    if (request) curRequests.push(request);
                }
            };
            return [curIndex, GM_xmlhttpRequest(requestBody), aTag.href];
        }
        if (!aTag) {
            let waitAtagReadyInterval = setInterval(function () {
                if (downNum >= aEles.length) clearInterval(waitAtagReadyInterval);
                aTag = aEles[curIndex];
                if (aTag) {
                    clearInterval(waitAtagReadyInterval);
                    request(aTag, curIndex);
                }
            }, 1000);
            return null;
        }
        return request(aTag, curIndex);
    };
    function getDocEle(str) {
        var doc = null;
        try {
            doc = document.implementation.createHTMLDocument('');
            doc.documentElement.innerHTML = str;
        }
        catch (e) {
            console.log('parse error');
        }
        return doc;
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
    function processDoc(i, aTag, doc, cause) {
        let contentResult = getPageContent(doc, content => {
            cbFunc(content);
        });
        let cbFunc = content => {
            rCats[i] = (aTag.innerText.trim() + "\r\n" + content + (cause || ''));
            curRequests = curRequests.filter(function (e) { return e[0] != i });
            txtDownContent.style.display = "block";
            txtDownWords.innerHTML = getI18n("downloading", [downNum, (aEles.length - downNum), aTag.innerText]);
            if (downNum == aEles.length) {
                txtDownWords.innerHTML = getI18n("complete", [downNum]);
                sortInnerPage();
                var blob = new Blob([i18n.info + "\r\n\r\n" + document.title + "\r\n\r\n" + rCats.join("\r\n\r\n")], { type: "text/plain;charset=utf-8" });
                saveAs(blob, document.title + ".txt");
            }
        };
        if (contentResult !== false) {
            cbFunc(contentResult);
        }
    }
    var downThreadNum = parseInt(GM_getValue("downThreadNum"));
    downThreadNum = downThreadNum > 0 ? downThreadNum : 20;
    for (var i = 0; i < downThreadNum; i++) {
        let request = downOnce();
        if (request) curRequests.push(request);
        if (downIndex >= aEles.length - 1 || downIndex >= downThreadNum - 1) break;
        else downIndex++;
    }

    /*for(let i=0;i<aEles.length;i++){
        let aTag=aEles[i];
        GM_xmlhttpRequest({
            method: 'GET',
            url: aTag.href,
            overrideMimeType:"text/html;charset="+document.charset,
            onload: function(result) {
                var doc = getDocEle(result.responseText);
                processDoc(i, aTag, doc);
            }
        });
    }*/
}
