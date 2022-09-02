import { Memento, myerror } from "@vscrebook/utils"
import { existsSync, mkdirSync } from "fs"
import { homedir } from "os"
import { join } from "path"

export class ConfigBase<Configuration extends Memento> {
    private readonly rootSection = 'vscrebook'

    constructor(private getConfig: (section: string) => Configuration) {
        if (!existsSync(this.downloadPath)) {
            try {
                mkdirSync(this.downloadPath)
            } catch (error) {
                myerror((error as Error).message)
                myerror('下载路径异常，请更换下载路径!')
            }
        }
    }

    private get cfg(): Configuration {
        return this.getConfig(this.rootSection)
    }

    private get<T>(section: string, dft: T): T {
        return this.cfg.get<T>(section, dft) as T
    }

    private update<T>(section: string, v: T): void {
        this.cfg.update<T>(section, v)
    }

    get pageSize(): number { return this.get<number>('pageSize', 25) }
    set pageSize(v: number) { this.update('pageSize', v) }

    get downloadPath(): string { return this.get<string>('downloadPath', join(homedir(), 'downloads')) }
    set downloadPath(v: string) { this.update('downloadPath', v) }

    get autoFlipTime(): number { return this.get<number>('autoFlipTime', 3000) }
    set autoFlipTime(v: number) { this.update('autoFlipTime', v) }

    get displayMode(): DisplayMode { return this.get<DisplayMode>('displayMode', 'statusBar') }
    set displayMode(v: DisplayMode) { this.update('displayMode', v) }

    get showMoreInfo(): ShowMoreInfo {
        return this.get<object>('showMoreInfo', {
            caimoge: true,
            wbxsw: false,
            aixiashu: false,
            maxreader: false,
        }) as ShowMoreInfo
    }

    set showMoreInfo(v: ShowMoreInfo) { this.update('showMoreInfo', v) }

    get downloadSettings(): DownloadSettings {
        return this.get<object>('downloadSettings', {
            caimoge: 'txt & chapters',
            wbxsw: 'chaptersOnly',
            aixiashu: 'txt & chapters',
            maxreader: 'chaptersOnly',
        }) as DownloadSettings
    }

    set downloadSettings(v: DownloadSettings) {
        this.update('downloadSettings', v)
    }
}

// class Config extends ConfigBase<Uri, WorkspaceConfiguration> {
// }

// export const cfg = new Config(Uri.parse(''), workspace.getConfiguration)