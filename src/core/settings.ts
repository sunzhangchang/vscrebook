import _ = require("lodash")
import { window } from "vscode"
import { configAs, ExtConfig, getConfig, setConfig } from "./config"

async function getNewConfig(key: string) {
    let val: string | undefined | null
    const tmp = _.get(ExtConfig, key) as ConfigSet
    const placeHolder = `${tmp.desc}: ${_.get(getConfig(), key)}`
    switch (tmp.form) {
        case 'input': {
            val = await window.showInputBox({
                placeHolder,
            })
            break
        }

        case 'choose': {
            val = await window.showQuickPick(tmp.choices ?? [], {
                placeHolder,
            })
            break
        }

        case 'none':
            val = null
            break

        default:
            val = undefined
            break
    }
    if (_.isNil(val)) {
        return val
    }
    return configAs(tmp, val)
}

export async function settings(): Promise<void> {
    const key = await window.showQuickPick(_.keys(ExtConfig), {
        matchOnDescription: true,
        placeHolder: '请选择需要设置的项目',
    })

    if (_.isUndefined(key)) {
        return
    }

    const newValue = await getNewConfig(key)

    if (_.isNull(newValue)) {
        window.showInformationMessage('此项请在设置中调整!')
        return
    }

    if (_.isUndefined(newValue)) {
        return
    }

    setConfig(key, newValue)

    await window.showInformationMessage('设置已更新!')
}
