import _ = require("lodash")
import { window } from "vscode"
import { ConfigDescriptions, setConfig } from "../utils/config"

export async function settings() {
    let key = await window.showQuickPick(_.keys(ConfigDescriptions), {
        matchOnDescription: true,
        placeHolder: '请选择需要设置的项目',
    })
    if (_.isUndefined(key)) {
        return
    }

    let newValue = await window.showInputBox({
        placeHolder: _.get(ConfigDescriptions, key)
    })
    if (_.isUndefined(newValue)) {
        return
    }

    setConfig(key, newValue)

    await window.showInformationMessage('设置已更新!')
}