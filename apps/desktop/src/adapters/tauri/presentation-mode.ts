import type { PresentationMode } from '@vscrebook/core'

export interface WindowPresentationControls {
    setDecorations(value: boolean): Promise<void>
    setShadow(value: boolean): Promise<void>
    setAlwaysOnTop(value: boolean): Promise<void>
}

export async function applyWindowMode(
    window: WindowPresentationControls,
    mode: PresentationMode,
): Promise<void> {
    const decorations = mode === 'normal'
    const shadow = mode === 'normal'
    const alwaysOnTop = mode === 'stealth'

    try {
        await window.setDecorations(decorations)
        await window.setShadow(shadow)
        await window.setAlwaysOnTop(alwaysOnTop)
    } catch (error) {
        await Promise.allSettled([
            window.setDecorations(!decorations),
            window.setShadow(!shadow),
            window.setAlwaysOnTop(!alwaysOnTop),
        ])
        throw error
    }
}
