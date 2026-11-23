import type { BossTexts, DisplayMode, DownloadSettings, ShowMoreInfo } from './types'

export type { BossTexts, DisplayMode, DownloadSettings, ShowMoreInfo, SourceEngine } from './types'

export interface ConfigSection {
    get<T>(key: string, defaultValue: T): T
    update<T>(key: string, value: T): unknown
}
export interface ConfigBaseOptions {
    homeDirectory: string
    ensureDownloadDirectory?: (path: string) => void
}

export class ConfigBase<Configuration extends ConfigSection = ConfigSection> {
    private readonly rootSection = 'vscrebook'

    constructor(
        private getConfig: (section: string) => Configuration,
        private options: ConfigBaseOptions
    ) {
        this.options.ensureDownloadDirectory?.(this.downloadPath)
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

    get downloadPath(): string {
        const dir = `${this.options.homeDirectory}/Downloads`
        const path = this.get<string>('downloadPath', dir)
        return path.replaceAll('${homedir}', this.options.homeDirectory)
    }
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

    get bossTexts(): BossTexts {
        return this.get<object>('bossTexts', []) as BossTexts
    }

    set bossTexts(v: BossTexts) {
        this.update('bossTexts', v)
    }
}
