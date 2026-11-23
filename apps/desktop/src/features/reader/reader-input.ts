import { normalizeShortcut, shortcutFromKeyboardEvent } from '../settings/shortcut-format.ts'

export type ReaderShortcut = 'toggle-mode' | 'previous-page' | 'next-page' | 'jump-page'

export interface ReaderKeyboardEvent {
    key: string
    code?: string
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    target?: EventTarget | {
        tagName?: string
        isContentEditable?: boolean
    } | null
}

export function matchReaderShortcut(
    event: ReaderKeyboardEvent,
    bindings: Partial<Record<'toggleMode' | 'previousPage' | 'nextPage' | 'jumpPage' | 'openBook', string>>,
): ReaderShortcut | 'open-book' | null {
    const target = event.target as { tagName?: string; isContentEditable?: boolean } | null | undefined
    const tagName = target?.tagName?.toUpperCase()
    if (target?.isContentEditable || tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return null

    const pressed = shortcutFromKeyboardEvent({
        code: event.code ?? event.key,
        ctrlKey: Boolean(event.ctrlKey),
        metaKey: Boolean(event.metaKey),
        altKey: Boolean(event.altKey),
        shiftKey: Boolean(event.shiftKey),
    })
    if (!pressed) return null

    const action = (Object.keys(bindings) as Array<'toggleMode' | 'previousPage' | 'nextPage' | 'jumpPage' | 'openBook'>)
        .find((key) => bindings[key] && normalizeShortcut(bindings[key]!) === pressed)
    if (!action) return null
    const actionMap: Record<typeof action, ReaderShortcut | 'open-book'> = {
        toggleMode: 'toggle-mode',
        previousPage: 'previous-page',
        nextPage: 'next-page',
        jumpPage: 'jump-page',
        openBook: 'open-book',
    }
    return actionMap[action]
}

export function parsePageNumber(value: string, totalPages: number): number | null {
    const normalized = value.trim()
    if (!/^\d+$/.test(normalized)) return null

    const page = Number(normalized)
    if (!Number.isSafeInteger(page) || page < 1 || page > totalPages) return null
    return page
}
