import { workspace } from "vscode"
import { defaultPageSize } from "."

export const enum ExtConfig {
    pageSize = 'vscrebook.pageSize',
    lineBreak = 'vscrebook.lineBreak',
}

export const getWsConfig = workspace.getConfiguration().get
export const updateWsConfig = workspace.getConfiguration().update

export function getConfig(): ConfigType {
    if (!getWsConfig(ExtConfig.pageSize)) {
        updateWsConfig(ExtConfig.pageSize, defaultPageSize, true)
    }

    if (!getWsConfig(ExtConfig.lineBreak)) {
        updateWsConfig(ExtConfig.lineBreak, 'string', true)
    }

    return {
        pageSize: getWsConfig(ExtConfig.pageSize) as number,
        lineBreak: getWsConfig(ExtConfig.lineBreak) as string,
    }
}
