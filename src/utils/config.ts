import { workspace } from "vscode"
import _ = require("lodash")

export const extName = 'vscrebook'

export const enum Default {
    pageSize = 25,
    downloadPath = 'D:/Downloads/',
    autoFlipTime = 3000,
}

export const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    lineBreak = 'vscrebook.lineBreak',
    downloadPath = 'vscrebook.downloadPath',
    autoFlipTime = 'vscrebook.autoFlipTime',
}

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (_.isUndefined(getWsConfig(ExtConfig.pageSize))) {
        updateWsConfig(ExtConfig.pageSize, Default.pageSize, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.lineBreak))) {
        updateWsConfig(ExtConfig.lineBreak, ' ', true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.downloadPath))) {
        updateWsConfig(ExtConfig.downloadPath, Default.downloadPath, true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        lineBreak: getWsConfig(ExtConfig.lineBreak) as string,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string
    }
}
