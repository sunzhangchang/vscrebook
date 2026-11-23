import { normalizeShortcut } from './shortcut-format.ts'
export { normalizeShortcut, shortcutFromKeyboardEvent } from './shortcut-format.ts'

export const DEFAULT_SHORTCUTS = {
    toggleMode: 'CommandOrControl+Shift+M',
    previousPage: 'CommandOrControl+Alt+Left',
    nextPage: 'CommandOrControl+Alt+Right',
    jumpPage: 'CommandOrControl+G',
    openBook: 'CommandOrControl+O',
} as const

export type ShortcutAction = keyof typeof DEFAULT_SHORTCUTS
export type ShortcutBindings = Record<ShortcutAction, string>
export type ShortcutStatus = 'registered' | 'duplicate' | 'conflict' | 'not-applied'
export type ShortcutStatuses = Partial<Record<ShortcutAction, ShortcutStatus>>

const actions = Object.keys(DEFAULT_SHORTCUTS) as ShortcutAction[]
export const shortcutActionToReaderAction: Record<ShortcutAction, 'toggle-mode' | 'previous-page' | 'next-page' | 'jump-page' | 'open-book'> = {
    toggleMode: 'toggle-mode',
    previousPage: 'previous-page',
    nextPage: 'next-page',
    jumpPage: 'jump-page',
    openBook: 'open-book',
}

export function findShortcutConflicts(bindings: Partial<Record<ShortcutAction, string>>): Partial<Record<ShortcutAction, ShortcutAction[]>> {
    const normalized = new Map<ShortcutAction, string>()
    for (const action of actions) {
        const shortcut = bindings[action]
        if (!shortcut) continue
        const canonical = normalizeShortcut(shortcut)
        if (canonical) normalized.set(action, canonical.toLowerCase())
    }

    const conflicts: Partial<Record<ShortcutAction, ShortcutAction[]>> = {}
    for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const shortcut = normalized.get(action)
        if (!shortcut) continue
        for (let j = i + 1; j < actions.length; j++) {
            const other = actions[j]
            if (normalized.get(other) !== shortcut) continue
            conflicts[action] ??= []
            conflicts[other] ??= []
            conflicts[action]?.push(other)
            conflicts[other]?.push(action)
        }
    }
    return conflicts
}

export interface GlobalShortcutApi {
    register(shortcut: string, handler: (event: { state: string }) => void): Promise<void>
    unregister(shortcut: string): Promise<void>
    isRegistered(shortcut: string): Promise<boolean>
}

export async function registerShortcutBindings(
    api: GlobalShortcutApi,
    desiredBindings: ShortcutBindings,
    onAction: (action: ShortcutAction) => void,
    activeBindings: Partial<Record<ShortcutAction, string>> = {},
): Promise<{ statuses: ShortcutStatuses; activeBindings: Partial<Record<ShortcutAction, string>>; applied: boolean }> {
    const duplicates = findShortcutConflicts(desiredBindings)
    if (Object.keys(duplicates).length > 0) {
        return {
            statuses: Object.fromEntries(actions.map((action) => [action, duplicates[action] ? 'duplicate' : 'not-applied'])) as ShortcutStatuses,
            activeBindings,
            applied: false,
        }
    }

    const previouslyRegistered = new Set(
        Object.values(activeBindings).flatMap((shortcut) => shortcut ? [normalizeShortcut(shortcut) ?? shortcut] : []),
    )
    for (const shortcut of previouslyRegistered) {
        if (await api.isRegistered(shortcut)) await api.unregister(shortcut)
    }

    const statuses: ShortcutStatuses = {}
    const registered: Partial<Record<ShortcutAction, string>> = {}
    let failed = false
    for (const action of actions) {
        const shortcut = normalizeShortcut(desiredBindings[action])
        if (!shortcut) {
            statuses[action] = 'conflict'
            failed = true
            break
        }

        try {
            await api.register(shortcut, (event) => {
                if (event.state === 'Pressed') onAction(action)
            })
            if (!await api.isRegistered(shortcut)) throw new Error('Global shortcut is not registered')
            statuses[action] = 'registered'
            registered[action] = shortcut
        } catch {
            statuses[action] = 'conflict'
            failed = true
            break
        }
    }

    if (!failed) return { statuses, activeBindings: registered, applied: true }

    for (const shortcut of new Set(Object.values(registered))) {
        if (shortcut && await api.isRegistered(shortcut)) await api.unregister(shortcut)
    }
    const restored: Partial<Record<ShortcutAction, string>> = {}
    for (const action of actions) {
        const previous = activeBindings[action]
        if (!previous) continue
        const shortcut = normalizeShortcut(previous)
        if (!shortcut) continue
        try {
            await api.register(shortcut, (event) => {
                if (event.state === 'Pressed') onAction(action)
            })
            if (await api.isRegistered(shortcut)) restored[action] = shortcut
        } catch {
            // The previous shortcut may have become unavailable while the settings were edited.
        }
    }
    for (const action of actions) statuses[action] ??= 'not-applied'
    for (const action of actions) {
        if (statuses[action] === 'registered') statuses[action] = 'not-applied'
    }
    return { statuses, activeBindings: restored, applied: false }
}

export interface ShortcutStore {
    get<T>(key: string): Promise<T | undefined>
    set<T>(key: string, value: T): Promise<void>
    save(): Promise<void>
}

export async function loadShortcutBindings(store: ShortcutStore): Promise<ShortcutBindings> {
    const stored = await store.get<Partial<Record<ShortcutAction, string>>>('shortcuts')
    const bindings: ShortcutBindings = { ...DEFAULT_SHORTCUTS }
    if (!stored || typeof stored !== 'object') return bindings

    for (const action of actions) {
        const shortcut = stored[action]
        if (typeof shortcut !== 'string') continue
        const normalized = normalizeShortcut(shortcut)
        if (normalized) bindings[action] = normalized
    }
    return bindings
}

export async function saveShortcutBindings(store: ShortcutStore, bindings: ShortcutBindings): Promise<void> {
    await store.set('shortcuts', bindings)
    await store.save()
}

