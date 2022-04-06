import { workspace } from "vscode"
import _ = require("lodash")
import { join } from "path"

export const extName = 'vscrebook'

// eslint-disable-next-line @typescript-eslint/naming-convention
const Default: ConfigType = {
    pageSize: 25,
    downloadPath: (() => {
        if (!_.isUndefined(process.env.HOME)) {
            return join(process.env.HOME, 'downloads')
        }
        if (!_.isUndefined(process.env.USERPROFILE)) {
            return join(process.env.USERPROFILE, 'Downloads')
        }
        return __dirname
    })(),
    autoFlipTime: 3000,
    displayMode: 'statusBar',
}

enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    downloadPath = 'vscrebook.downloadPath',
    autoFlipTime = 'vscrebook.autoFlipTime',
    displayMode = 'vscrebook.displayMode',
}

export enum ConfigDescriptions {
    pageSize = '每页显示字数',
    downloadPath = '下载的小说的储存路径',
    autoFlipTime = '自动翻页的速度(每页的时间/ms)',
    displayMode = '显示小说文字的方式',
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

let config: ConfigType = {
    pageSize: Default.pageSize,
    downloadPath: Default.downloadPath,
    autoFlipTime: Default.autoFlipTime,
    displayMode: Default.displayMode,
}

export function setConfig(key: string, value: any) {
    config = _(config).set(key, value).value()
}

export function getConfig(): ConfigType {
    _(config).forEach((key, value) => {
        updateWsConfig(key as string, value)
    })

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string,
        autoFlipTime: getWsConfig(ExtConfig.autoFlipTime) as number,
        displayMode: getWsConfig(ExtConfig.displayMode) as DisPlayMode,
    }
}
