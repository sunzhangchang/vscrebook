import _ = require("lodash")
import { window } from "vscode"
import { ConfigDescriptions, ExtConfig, setConfig } from "../utils/config"

async function setType(key: string) {
    let res: string | undefined
    let tmp = _.get(ExtConfig, key)
    switch (tmp.type) {
        case 'input': {
            res = await window.showInputBox({
                placeHolder: _.get(ConfigDescriptions, key)
            })
            break
        }

        case 'choose': {
            res = await window.showQuickPick(tmp.choices ?? [])
            break
        }

        default:
            res = undefined
            break
    }
    return res
}

export async function settings() {
    let key = await window.showQuickPick(_.keys(ConfigDescriptions), {
        matchOnDescription: true,
        placeHolder: '请选择需要设置的项目',
    })
    if (_.isUndefined(key)) {
        return
    }

    let newValue = await setType(key)
    if (_.isUndefined(newValue)) {
        return
    }

    setConfig(key, newValue)

    await window.showInformationMessage('设置已更新!')
}