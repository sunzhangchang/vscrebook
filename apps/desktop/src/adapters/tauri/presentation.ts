import { isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import type { ApplyPresentationMode } from '@vscrebook/core'
import { applyWindowMode } from './presentation-mode'

export const applyDesktopPresentationMode: ApplyPresentationMode = async (mode) => {
    if (!isTauri()) return

    await applyWindowMode(getCurrentWindow(), mode)
}
