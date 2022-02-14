import { workspace } from "vscode"
import _ = require("lodash")

export const extName = 'vscrebook'

const enum Default {
    pageSize = 25,
    downloadPath = 'D:/Downloads/',
    autoFlipTime = 3000,
}

const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    downloadPath = 'vscrebook.downloadPath',
    autoFlipTime = 'vscrebook.autoFlipTime',
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (_.isUndefined(getWsConfig(ExtConfig.pageSize))) {
        updateWsConfig(ExtConfig.pageSize, Default.pageSize, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.downloadPath))) {
        updateWsConfig(ExtConfig.downloadPath, Default.downloadPath, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.autoFlipTime))) {
        updateWsConfig(ExtConfig.autoFlipTime, Default.autoFlipTime, true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string,
        autoFlipTime: getWsConfig(ExtConfig.autoFlipTime) as number,
    }
}
