const modifierAliases = new Map<string, string>([
    ['commandorcontrol', 'CommandOrControl'], ['cmdorctrl', 'CommandOrControl'], ['ctrlorcmd', 'CommandOrControl'],
    ['controlorcommand', 'CommandOrControl'], ['ctrl', 'CommandOrControl'], ['control', 'CommandOrControl'],
    ['alt', 'Alt'], ['option', 'Alt'], ['shift', 'Shift'], ['super', 'Super'], ['meta', 'Super'],
    ['command', 'Super'], ['cmd', 'Super'],
])
const modifierOrder = ['CommandOrControl', 'Control', 'Alt', 'Shift', 'Super']
const namedKeys = new Map<string, string>([
    ['arrowleft', 'Left'], ['left', 'Left'], ['arrowright', 'Right'], ['right', 'Right'],
    ['arrowup', 'Up'], ['up', 'Up'], ['arrowdown', 'Down'], ['down', 'Down'],
    ['pageup', 'PageUp'], ['pagedown', 'PageDown'], ['home', 'Home'], ['end', 'End'],
    ['insert', 'Insert'], ['delete', 'Delete'], ['backspace', 'Backspace'], ['tab', 'Tab'],
    ['space', 'Space'], ['enter', 'Enter'], ['escape', 'Escape'], ['esc', 'Escape'],
    ['comma', 'Comma'], ['period', 'Period'],
])

export function normalizeShortcut(shortcut: string): string | null {
    const parts = shortcut.split('+').map((part) => part.trim()).filter(Boolean)
    if (parts.length < 2) return null

    const modifiers: string[] = []
    const keys: string[] = []
    for (const part of parts) {
        const modifier = modifierAliases.get(part.toLowerCase())
        if (modifier) {
            if (modifiers.includes(modifier)) return null
            modifiers.push(modifier)
            continue
        }

        const namedKey = namedKeys.get(part.toLowerCase())
        const normalizedKey = namedKey
            ?? (/^f(?:[1-9]|1\d|2[0-4])$/i.test(part) ? part.toUpperCase() : null)
            ?? (/^[a-z0-9]$/i.test(part) ? part.toUpperCase() : null)
        if (!normalizedKey || keys.length > 0) return null
        keys.push(normalizedKey)
    }

    if (keys.length !== 1 || modifiers.length === 0) return null
    if (modifiers.includes('CommandOrControl') && (modifiers.includes('Control') || modifiers.includes('Super'))) return null

    modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b))
    return [...modifiers, keys[0]].join('+')
}

export function shortcutFromKeyboardEvent(event: {
    code: string
    ctrlKey: boolean
    metaKey: boolean
    altKey: boolean
    shiftKey: boolean
}): string | null {
    const modifiers: string[] = []
    if (event.ctrlKey || event.metaKey) modifiers.push('CommandOrControl')
    if (event.altKey) modifiers.push('Alt')
    if (event.shiftKey) modifiers.push('Shift')

    let key = event.code
    if (/^Key[A-Z]$/.test(key)) key = key.slice(3)
    else if (/^Digit[0-9]$/.test(key)) key = key.slice(5)
    else if (key === 'NumpadEnter') key = 'Enter'
    else if (key.startsWith('Arrow')) key = key.slice(5)

    if (modifiers.length === 0) return null
    return normalizeShortcut([...modifiers, key].join('+'))
}
