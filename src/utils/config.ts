import { workspace } from "vscode"
import _ = require("lodash")

export const defaultPageSize = 25
export const defaultDownloadPath = 'D:/Downloads/'

export const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    lineBreak = 'vscrebook.lineBreak',
    downloadPath = 'vscrebook.downloadPath'
}

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (_.isUndefined(getWsConfig(ExtConfig.pageSize))) {
        updateWsConfig(ExtConfig.pageSize, defaultPageSize, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.lineBreak))) {
        updateWsConfig(ExtConfig.lineBreak, ' ', true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.downloadPath))) {
        updateWsConfig(ExtConfig.downloadPath, defaultDownloadPath, true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        lineBreak: getWsConfig(ExtConfig.lineBreak) as string,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string
    }
}
