import { workspace } from "vscode"

export const defaultPageSize = 25
export const defaultDownloadPath = 'D:/Downloads'

export const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    lineBreak = 'vscrebook.lineBreak',
    downloadPath = 'vscrebook.downloadPath'
}

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (!getWsConfig(ExtConfig.pageSize)) {
        updateWsConfig(ExtConfig.pageSize, defaultPageSize, true)
    }

    if (!getWsConfig(ExtConfig.lineBreak)) {
        updateWsConfig(ExtConfig.lineBreak, ' ', true)
    }

    if (!getWsConfig(ExtConfig.downloadPath)) {
        updateWsConfig(ExtConfig.downloadPath, defaultDownloadPath, true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        lineBreak: getWsConfig(ExtConfig.lineBreak) as string,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string
    }
}
