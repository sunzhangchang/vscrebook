import { workspace } from "vscode"
import _ = require("lodash")
import { join } from "path"

export const extName = 'vscrebook'

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ExtConfig: ConfigSetObj = {
    pageSize: {
        name: `${extName}.pageSize`,
        desc: '每页显示字数',
        default: 25,
        type: 'number',
        form: 'input',
    },
    downloadPath: {
        name: `${extName}.downloadPath`,
        desc: '下载的小说的储存路径',
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
        name: `${extName}.autoFlipTime`,
        desc: '自动翻页的速度(每页的时间/ms)',
        default: 3000,
        type: 'number',
        form: 'input',
    },
    displayMode: {
        name: `${extName}.displayMode`,
        desc: '显示小说文字的方式',
        default: 'statusBar',
        type: 'string',
        form: 'choose',
        choices: ['statusBar', 'showInformation'],
    },
    statusConfig: {
        name: `${extName}.statusConfig`,
        desc: '设置网络书籍中是否显示书籍更新状态',
        default: {
            caimoge: true,
            wbxsw: false,
        },
        type: 'object',
        form: 'choose',
        choices: ['caimoge', 'wbxsw'],
    }
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

_(ExtConfig).forEach((value) => {
    const c = getWsConfig(value.name)
    if (_.isUndefined(c) || _.isEmpty(c)) {
        updateWsConfig(value.name, value.default, true)
    }
    if (_.isEqual(value.name, 'downloadPath')) {
        if (_.isEqual(getWsConfig(value.name), '~/downloads')) {
            updateWsConfig(value.name, value.default, true)
        }
    }
})

let config: ConfigType = {
    pageSize: getWsConfig(ExtConfig.pageSize.name) as number,
    downloadPath: getWsConfig(ExtConfig.downloadPath.name) as string,
    autoFlipTime: getWsConfig(ExtConfig.autoFlipTime.name) as number,
    displayMode: getWsConfig(ExtConfig.displayMode.name) as DisplayMode,
    statusConfig: getWsConfig(ExtConfig.statusConfig.name) as StatusConfig,
}

export function setConfig(key: string, value: any) {
    config = _(config).set(key, value).value()
    updateWsConfig(`${extName}.${key}`, value, true)
}

function getInnerConfig(key: string) {
    return _(config).get(_(key).chain().split('.').last().value())
}

export function updateConfig() {
    _(config).forEach((value, key) => {
        // debug(`vscrebook.${key}`, value)
        updateWsConfig(`${extName}.${key}`, value, true)
    })
}

export function getConfig(): ConfigType {
    return {
        pageSize: getInnerConfig(ExtConfig.pageSize.name) as number,
        downloadPath: getInnerConfig(ExtConfig.downloadPath.name) as string,
        autoFlipTime: getInnerConfig(ExtConfig.autoFlipTime.name) as number,
        displayMode: getInnerConfig(ExtConfig.displayMode.name) as DisplayMode,
        statusConfig: getInnerConfig(ExtConfig.statusConfig.name) as StatusConfig,
    }
}
