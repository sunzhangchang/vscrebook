import _ from "lodash"
import { window } from "vscode"
import { book } from "../book"
import { Errors, myerror } from "../utils/error"
import { getConfig } from "./config"
import { showNovelText } from "./show"

function bookSearch(keyword: string): searchCtxResult[] {
    if (_.isNil(book)) {
        return []
    }
    const list: searchCtxResult[] = []
    const re = new RegExp(keyword, 'g')
    const true_ = true
    while (true_) {
        const res = re.exec(book.text)
        if (_.isNull(res)) {
            break
        }
        const index = res.index
        const page = Math.ceil(index / getConfig().pageSize)
        const txt = book.text.substring(index - 30, index + 31)
        list.push({
            index,
            page,
            txt,
        })
    }
    return list
}

export async function searchContext(): Promise<void> {
    if (_.isNil(book)) {
        myerror(Errors.bookUndefined)
        return
    }
    const keyword = await window.showInputBox({
        placeHolder: '请输入关键字',
    })

    if (_.isUndefined(keyword)) {
        return
    }

    const list = bookSearch(keyword)
    const res = await window.showQuickPick(list.map((v) => `${v.page}: ${v.txt}`), {
        canPickMany: false,
        matchOnDescription: true,
        matchOnDetail: true,
    })

    if (_.isUndefined(res)) {
        return
    }

    const page = parseInt(res.split(': ')[0])
    await new Promise(() => {
        showNovelText(page)
    }).then(() => {
        window.showInformationMessage('跳转成功!')
    })
}
