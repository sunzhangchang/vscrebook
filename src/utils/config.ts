import { workspace } from "vscode"
import _ = require("lodash")
import { join } from "path"

export const extName = 'vscrebook'

// eslint-disable-next-line @typescript-eslint/naming-convention
const Default = {
    pageSize: 25,
    downloadPath: (() => {
        if (!_.isUndefined(process.env.HOME)) {
            return join(process.env.HOME, 'downloads')
        }
        if (!_.isUndefined(process.env.USERPROFILE)) {
            return join(process.env.USERPROFILE, 'Downloads')
        }
    })(),
    autoFlipTime: 3000,
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

    if (_.isUndefined(getWsConfig(ExtConfig.downloadPath)) || _.isEmpty(getWsConfig(ExtConfig.downloadPath))) {
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
