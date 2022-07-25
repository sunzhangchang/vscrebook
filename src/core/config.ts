import { workspace } from "vscode"
import _ from "lodash"
import { join } from "path"
import { homedir } from "os"

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
        default: join(homedir(), 'downloads'),
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
    showMoreInfo: {
        name: `${extName}.showMoreInfo`,
        desc: '设置网络书籍中是否显示书籍更多信息',
        default: {
            caimoge: true,
            wbxsw: false,
            aixiashu: false,
            maxreader: false,
        },
        type: 'object',
        form: 'choose',
        choices: ['caimoge', 'wbxsw', 'aixiashu', 'maxreader'],
    },
    downloadSettings: {
        name: `${extName}.downloadSettings`,
        desc: '网络书籍下载设置',
        default: {
            'caimoge': 'txt & chapters',
            'wbxsw': 'chaptersOnly',
            'aixiashu': 'txt & chapters',
            'maxreader': 'chaptersOnly',
        },
        type: 'object',
        form: 'none',
    },
    threadNum: {
        name: `${extName}.threadNum`,
        desc: '下载线程数',
        default: 20,
        type: 'number',
        form: 'input',
    }
}

const getWsConfig = workspace.getConfiguration().get
const updateWsConfig = workspace.getConfiguration().update

export function configAs(cfg: ConfigSet, val: unknown): string | number | obj | undefined {
    if (_.isUndefined(val)) {
        return undefined
    }
    let res
    switch (cfg.type) {
        case 'number':
            res = parseInt(val as string)
            break

        case 'string':
            res = val as string
            break

        case 'object':
            res = JSON.parse(val as string) as obj
            break

        default:
            break
    }
    return res
}

_(ExtConfig).forEach((value) => {
    const c = getWsConfig(value.name)
    if (_.isUndefined(c)) {
        updateWsConfig(value.name, value.default, true)
    }
    if (_.isEqual(value.name, `${extName}.downloadPath`)) {
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
    showMoreInfo: getWsConfig(ExtConfig.showMoreInfo.name) as ShowMoreInfo,
    downloadSettings: getWsConfig(ExtConfig.downloadSettings.name) as DownloadSettings,
    threadNum: getWsConfig(ExtConfig.threadNum.name) as ThreadNum,
}

export function setConfig(key: string, value: unknown): void {
    config = _(config).set(key, value).value()
    updateWsConfig(`${extName}.${key}`, value, true)
}

function getInnerConfig(key: string) {
    return _(config).get(_(key).chain().split('.').last().value())
}

export function updateConfig(): void {
    _(config).forEach((value, key) => {
        updateWsConfig(`${extName}.${key}`, value, true)
    })
}

export function getConfig(): ConfigType {
    return {
        pageSize: getInnerConfig(ExtConfig.pageSize.name) as number,
        downloadPath: getInnerConfig(ExtConfig.downloadPath.name) as string,
        autoFlipTime: getInnerConfig(ExtConfig.autoFlipTime.name) as number,
        displayMode: getInnerConfig(ExtConfig.displayMode.name) as DisplayMode,
        showMoreInfo: getInnerConfig(ExtConfig.showMoreInfo.name) as ShowMoreInfo,
        downloadSettings: getInnerConfig(ExtConfig.downloadSettings.name) as DownloadSettings,
        threadNum: getInnerConfig(ExtConfig.threadNum.name) as ThreadNum,
    }
}
