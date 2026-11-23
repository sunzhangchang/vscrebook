import assert from 'node:assert/strict'
import test from 'node:test'
import * as presentation from '../src/adapters/tauri/presentation-mode.ts'
import * as readerInput from '../src/features/reader/reader-input.ts'
import * as bindings from '../src/features/settings/shortcut-bindings.ts'

test('stealth mode removes all decorations and keeps the window on top', async () => {
    const calls = []
    const window = {
        setDecorations: async (value) => calls.push(['decorations', value]),
        setShadow: async (value) => calls.push(['shadow', value]),
        setAlwaysOnTop: async (value) => calls.push(['alwaysOnTop', value]),
    }

    await presentation.applyWindowMode(window, 'stealth')

    assert.deepEqual(calls, [['decorations', false], ['shadow', false], ['alwaysOnTop', true]])
})

test('normal mode restores decorations and removes always-on-top', async () => {
    const calls = []
    const window = {
        setDecorations: async (value) => calls.push(['decorations', value]),
        setShadow: async (value) => calls.push(['shadow', value]),
        setAlwaysOnTop: async (value) => calls.push(['alwaysOnTop', value]),
    }

    await presentation.applyWindowMode(window, 'normal')

    assert.deepEqual(calls, [['decorations', true], ['shadow', true], ['alwaysOnTop', false]])
})

test('failed mode change rolls window presentation back', async () => {
    const calls = []
    let failTopmost = true
    const window = {
        setDecorations: async (value) => calls.push(['decorations', value]),
        setShadow: async (value) => calls.push(['shadow', value]),
        setAlwaysOnTop: async (value) => {
            calls.push(['alwaysOnTop', value])
            if (value && failTopmost) {
                failTopmost = false
                throw new Error('native window failure')
            }
        },
    }

    await assert.rejects(presentation.applyWindowMode(window, 'stealth'), /native window failure/)
    assert.deepEqual(calls, [
        ['decorations', false], ['shadow', false], ['alwaysOnTop', true],
        ['decorations', true], ['shadow', true], ['alwaysOnTop', false],
    ])
})

test('custom bindings match captured keys and do not use hard-coded shortcuts', () => {
    const custom = {
        toggleMode: 'Ctrl+Shift+K',
        previousPage: 'Alt+Left',
        nextPage: 'Alt+Right',
        jumpPage: 'Ctrl+J',
        openBook: 'Ctrl+B',
    }

    assert.equal(readerInput.matchReaderShortcut({ key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true }, custom), 'toggle-mode')
    assert.equal(readerInput.matchReaderShortcut({ key: 'ArrowLeft', code: 'ArrowLeft', altKey: true }, custom), 'previous-page')
    assert.equal(readerInput.matchReaderShortcut({ key: 'm', code: 'KeyM', ctrlKey: true, shiftKey: true }, custom), null)
})

test('keyboard recording converts physical keys to valid global shortcut strings', () => {
    assert.equal(bindings.shortcutFromKeyboardEvent({ code: 'KeyK', ctrlKey: true, metaKey: false, altKey: false, shiftKey: true }), 'CommandOrControl+Shift+K')
    assert.equal(bindings.shortcutFromKeyboardEvent({ code: 'ArrowLeft', ctrlKey: false, metaKey: true, altKey: true, shiftKey: false }), 'CommandOrControl+Alt+Left')
    assert.equal(bindings.shortcutFromKeyboardEvent({ code: 'KeyK', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }), null)
})

test('reader shortcuts do not intercept text entry', () => {
    assert.equal(readerInput.matchReaderShortcut({
        key: 'o',
        code: 'KeyO',
        ctrlKey: true,
        target: { tagName: 'INPUT', isContentEditable: false },
    }, bindings.DEFAULT_SHORTCUTS), null)
})

test('page jump accepts only integer pages within the book', () => {
    assert.equal(readerInput.parsePageNumber('12', 20), 12)
    assert.equal(readerInput.parsePageNumber('0', 20), null)
    assert.equal(readerInput.parsePageNumber('21', 20), null)
    assert.equal(readerInput.parsePageNumber('2.5', 20), null)
})

test('default global bindings cover every desktop reader action', () => {
    assert.deepEqual(bindings.DEFAULT_SHORTCUTS, {
        toggleMode: 'CommandOrControl+Shift+M',
        previousPage: 'CommandOrControl+Alt+Left',
        nextPage: 'CommandOrControl+Alt+Right',
        jumpPage: 'CommandOrControl+G',
        openBook: 'CommandOrControl+O',
    })
})

test('shortcut normalization detects aliases and case-insensitive duplicates', () => {
    assert.equal(bindings.normalizeShortcut('ctrl + shift + m'), 'CommandOrControl+Shift+M')
    assert.equal(bindings.normalizeShortcut('CmdOrCtrl+SHIFT+M'), 'CommandOrControl+Shift+M')
    assert.deepEqual(
        bindings.findShortcutConflicts({
            toggleMode: 'Ctrl+Shift+M',
            previousPage: 'CommandOrControl+Shift+M',
            nextPage: 'Ctrl+Alt+Right',
        }),
        { toggleMode: ['previousPage'], previousPage: ['toggleMode'] },
    )
})

test('global shortcut registration reports duplicates and OS registration conflicts', async () => {
    const calls = []
    const registered = new Set(Object.values(bindings.DEFAULT_SHORTCUTS))
    const api = {
        async register(shortcut, handler) {
            calls.push(['register', shortcut])
            if (shortcut === 'CommandOrControl+Shift+J') throw new Error('shortcut unavailable')
            registered.add(shortcut)
            return handler
        },
        async unregister(shortcut) { calls.push(['unregister', shortcut]); registered.delete(shortcut) },
        async isRegistered(shortcut) { return registered.has(shortcut) },
    }

    const result = await bindings.registerShortcutBindings(api, {
        toggleMode: 'Ctrl+Shift+M',
        previousPage: 'CommandOrControl+Shift+P',
        nextPage: 'Ctrl+Alt+Right',
        jumpPage: 'Ctrl+Shift+J',
        openBook: 'Ctrl+O',
    }, () => undefined, { ...bindings.DEFAULT_SHORTCUTS })

    assert.deepEqual(result.statuses, {
        toggleMode: 'not-applied',
        previousPage: 'not-applied',
        nextPage: 'not-applied',
        jumpPage: 'conflict',
        openBook: 'not-applied',
    })
    assert.equal(calls.some(([operation, shortcut]) => operation === 'register' && shortcut === 'CommandOrControl+Shift+P'), true)
    assert.equal(calls.some(([operation, shortcut]) => operation === 'unregister' && shortcut === 'CommandOrControl+Shift+M'), true)
    assert.equal(result.activeBindings.toggleMode, 'CommandOrControl+Shift+M')
    assert.equal(result.activeBindings.jumpPage, 'CommandOrControl+G')
})

test('shortcut settings repository restores defaults and persists updates', async () => {
    const values = new Map()
    let saved = false
    const store = {
        async get(key) { return values.get(key) },
        async set(key, value) { values.set(key, value) },
        async save() { saved = true },
    }

    assert.deepEqual(await bindings.loadShortcutBindings(store), bindings.DEFAULT_SHORTCUTS)
    const updated = { ...bindings.DEFAULT_SHORTCUTS, toggleMode: 'Ctrl+Shift+K' }
    await bindings.saveShortcutBindings(store, updated)

    assert.equal(saved, true)
    assert.equal((await bindings.loadShortcutBindings(store)).toggleMode, 'CommandOrControl+Shift+K')
})
