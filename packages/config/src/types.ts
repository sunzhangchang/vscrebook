export type DisplayMode = 'statusBar' | 'showInformation'

export type SourceEngine = 'caimoge' | 'wbxsw' | 'aixiashu' | 'maxreader'

export type ShowMoreInfo = Record<SourceEngine, boolean>

export type DownloadSettings = Record<SourceEngine, 'disable' | 'txtOnly' | 'chaptersOnly' | 'txt & chapters'>

export type BossTexts = string[]
