import _ = require("lodash")
import { window } from "vscode"
import { ConfigDescriptions, ExtConfig, setConfig } from "../utils/config"

async function getNewConfig(key: string) {
    let val: string | undefined
    let tmp = _.get(ExtConfig, key)
    switch (tmp.form) {
        case 'input': {
            val = await window.showInputBox({
                placeHolder: _.get(ConfigDescriptions, key)
            })
            break
        }

        case 'choose': {
            val = await window.showQuickPick(tmp.choices ?? [])
            break
        }

        default:
            val = undefined
            break
    }
    if (_.isUndefined(val)) {
        return undefined
    }
    let res
    switch (tmp.type) {
        case 'number':
            res = parseInt(val)
            break

        case 'string':
            res = val
            break

        case 'object':
            res = JSON.parse(val) as object
            break

        default:
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

    let newValue = await getNewConfig(key)
    if (_.isUndefined(newValue)) {
        return
    }

    setConfig(key, newValue)

    await window.showInformationMessage('设置已更新!')
}
