import { workspace } from "vscode"
import _ = require("lodash")
import { join } from "path"

export const extName = 'vscrebook'

export enum ConfigDescriptions {
    pageSize = '每页显示字数',
    downloadPath = '下载的小说的储存路径',
    autoFlipTime = '自动翻页的速度(每页的时间/ms)',
    displayMode = '显示小说文字的方式',
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ExtConfig: ConfigSetObj = {
    pageSize: {
        name: 'vscrebook.pageSize',
        default: 25,
        type: 'number',
        form: 'input',
    },
    downloadPath: {
        name: 'vscrebook.downloadPath',
        default: (() => {
            if (!_.isUndefined(process.env.HOME)) {
                return join(process.env.HOME, 'downloads')
            }
            if (!_.isUndefined(process.env.USERPROFILE)) {
                return join(process.env.USERPROFILE, 'Downloads')
            }
            return __dirname
        })(),
        type: 'string',
        form: 'input',
    },
    autoFlipTime: {
        name: 'vscrebook.autoFlipTime',
        default: 3000,
        type: 'number',
        form: 'input',
    },
    displayMode: {
        name: 'vscrebook.displayMode',
        default: 'statusBar',
        type: 'string',
        form: 'choose',
        choices: ['statusBar', 'showInformation'],
    },
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

_(ExtConfig).forEach((value) => {
    if (_.isUndefined(getWsConfig(value.name))) {
        updateWsConfig(value.name, value.default, true)
    }
})

let config: ConfigType = {
    pageSize: getWsConfig(ExtConfig.pageSize.name) as number,
    downloadPath: getWsConfig(ExtConfig.downloadPath.name) as string,
    autoFlipTime: getWsConfig(ExtConfig.autoFlipTime.name) as number,
    displayMode: getWsConfig(ExtConfig.displayMode.name) as DisplayMode,
    statusConfig: getWsConfig(ExtConfig.displayMode.name) as StatusConfig,
}

export function setConfig(key: string, value: any) {
    config = _(config).set(key, value).value()
    updateWsConfig(`vscrebook.${key}`, value, true)
}

function getInnerConfig(key: string) {
    return _(config).get(_(key).chain().split('.').last().value())
}

export function updateConfig() {
    _(config).forEach((value, key) => {
        // debug(`vscrebook.${key}`, value)
        updateWsConfig(`vscrebook.${key}`, value, true)
    })
}

export function getConfig(): ConfigType {
    return {
        pageSize: getInnerConfig(ExtConfig.pageSize.name) as number,
        downloadPath: getInnerConfig(ExtConfig.downloadPath.name) as string,
        autoFlipTime: getInnerConfig(ExtConfig.autoFlipTime.name) as number,
        displayMode: getInnerConfig(ExtConfig.displayMode.name) as DisplayMode,
    }
}
