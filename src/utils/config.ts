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
    sync: {}
}

const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    downloadPath = 'vscrebook.downloadPath',
    autoFlipTime = 'vscrebook.autoFlipTime',
    sync = 'vscrebook.sync',
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (_.isUndefined(getWsConfig(ExtConfig.pageSize))) {
        updateWsConfig(ExtConfig.pageSize, Default.pageSize, true)
    }

    // if (_.isUndefined(getWsConfig(ExtConfig.downloadPath)) || _.isEmpty(getWsConfig(ExtConfig.downloadPath))) {
    //     updateWsConfig(ExtConfig.downloadPath, Default.downloadPath, true)
    // }
    const tmp = getWsConfig(ExtConfig.downloadPath)
    if (_.isEqual(tmp, 'D:/Downloads/') || _.isEmpty(tmp)) {
        updateWsConfig(ExtConfig.downloadPath, Default.downloadPath, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.autoFlipTime))) {
        updateWsConfig(ExtConfig.autoFlipTime, Default.autoFlipTime, true)
    }

    if (_.isUndefined(getWsConfig(ExtConfig.sync))) {
        updateWsConfig(ExtConfig.sync, Default.sync, true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        downloadPath: getWsConfig(ExtConfig.downloadPath) as string,
        autoFlipTime: getWsConfig(ExtConfig.autoFlipTime) as number,
        sync: getWsConfig(ExtConfig.sync) as Object,
    }
}

export function updateSyncBookList(sync: Object) {
    updateWsConfig(ExtConfig.sync, sync, true)
}