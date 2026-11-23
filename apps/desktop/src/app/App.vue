<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { isRegistered, register, unregister } from '@tauri-apps/plugin-global-shortcut'
import { LazyStore } from '@tauri-apps/plugin-store'
import { Showing, type PresentationMode } from '@vscrebook/core'
import ReaderView from '../features/reader/ReaderView.vue'
import LibraryView from '../features/library/LibraryView.vue'
import { BookLibrary, type LibraryBook } from '../features/library/book-library'
import ShortcutSettings from '../features/settings/ShortcutSettings.vue'
import { useReader } from '../features/reader/useReader'
import { applyDesktopPresentationMode } from '../adapters/tauri/presentation'
import { matchReaderShortcut, parsePageNumber, type ReaderShortcut } from '../features/reader/reader-input'
import {
    DEFAULT_SHORTCUTS,
    loadShortcutBindings,
    registerShortcutBindings,
    saveShortcutBindings,
    shortcutActionToReaderAction,
    type ShortcutAction,
    type ShortcutBindings,
    type ShortcutStatuses,
} from '../features/settings/shortcut-bindings'

const fileInput = ref<HTMLInputElement>()
const libraryBooks = ref<LibraryBook[]>([])
const showingLibrary = ref(true)
const readerView = ref<InstanceType<typeof ReaderView>>()
const mode = ref<PresentationMode>('normal')
const library = new BookLibrary()
const reader = useReader(library)
const showing = new Showing(() => undefined, () => undefined, applyDesktopPresentationMode)
const settingsOpen = ref(false)
const isSavingShortcuts = ref(false)
const shortcutBindings = ref<ShortcutBindings>({ ...DEFAULT_SHORTCUTS })
const shortcutStatusBindings = ref<ShortcutBindings>({ ...DEFAULT_SHORTCUTS })
const shortcutStatuses = ref<ShortcutStatuses>({})
const activeShortcutBindings = ref<Partial<Record<ShortcutAction, string>>>({})
let shortcutStore: LazyStore | null = null

async function dispatchShortcut(action: ReaderShortcut | 'open-book'): Promise<void> {
    switch (action) {
        case 'toggle-mode':
            settingsOpen.value = false
            void changeMode(mode.value === 'normal' ? 'stealth' : 'normal')
            break
        case 'previous-page':
            void reader.showPage(reader.currentPage.value - 1)
            break
        case 'next-page':
            void reader.showPage(reader.currentPage.value + 1)
            break
        case 'jump-page':
            if (mode.value === 'stealth') await changeMode('normal')
            readerView.value?.focusJumpPage()
            break
        case 'open-book':
            if (mode.value === 'stealth') await changeMode('normal')
            fileInput.value?.click()
            break
    }
}

function onBrowserShortcut(event: KeyboardEvent): void {
    if (isTauri()) return
    const action = matchReaderShortcut(event, shortcutBindings.value)
    if (!action) return
    event.preventDefault()
    void dispatchShortcut(action)
}

function onGlobalShortcut(action: ShortcutAction): void {
    if (settingsOpen.value) return
    void dispatchShortcut(shortcutActionToReaderAction[action])
}

const globalShortcutApi = {
    register: (shortcut: string, handler: (event: { state: string }) => void) => register(shortcut, handler),
    unregister: (shortcut: string) => unregister(shortcut),
    isRegistered: (shortcut: string) => isRegistered(shortcut),
}

async function initializeShortcuts(): Promise<void> {
    if (!isTauri()) {
        try {
            const stored = localStorage.getItem('shortcuts')
            if (stored) shortcutBindings.value = { ...DEFAULT_SHORTCUTS, ...JSON.parse(stored) }
        } catch {
            shortcutBindings.value = { ...DEFAULT_SHORTCUTS }
        }
        document.addEventListener('keydown', onBrowserShortcut)
        shortcutStatuses.value = Object.fromEntries(
            Object.keys(shortcutBindings.value).map((action) => [action, 'registered']),
        ) as ShortcutStatuses
        shortcutStatusBindings.value = { ...shortcutBindings.value }
        return
    }

    shortcutStore = new LazyStore('settings.json')
    const saved = await loadShortcutBindings(shortcutStore)
    shortcutBindings.value = saved
    shortcutStatusBindings.value = { ...saved }
    let result = await registerShortcutBindings(globalShortcutApi, saved, onGlobalShortcut)
    if (!result.applied && JSON.stringify(saved) !== JSON.stringify(DEFAULT_SHORTCUTS)) {
        result = await registerShortcutBindings(globalShortcutApi, { ...DEFAULT_SHORTCUTS }, onGlobalShortcut)
        shortcutBindings.value = { ...DEFAULT_SHORTCUTS }
        shortcutStatusBindings.value = { ...DEFAULT_SHORTCUTS }
    }
    shortcutStatuses.value = result.statuses
    activeShortcutBindings.value = result.activeBindings
    if (result.applied && JSON.stringify(saved) !== JSON.stringify(DEFAULT_SHORTCUTS)) {
        await saveShortcutBindings(shortcutStore, DEFAULT_SHORTCUTS)
        shortcutBindings.value = { ...DEFAULT_SHORTCUTS }
    }
}

onMounted(() => {
    void refreshLibrary()
    void initializeShortcuts().catch((error) => {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法初始化全局快捷键'
    })
})
onBeforeUnmount(() => {
    document.removeEventListener('keydown', onBrowserShortcut)
    if (isTauri()) {
        for (const shortcut of new Set(Object.values(activeShortcutBindings.value))) {
            if (shortcut) void unregister(shortcut)
        }
    }
})

async function openFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement
    try {
        await reader.openFile(input.files?.[0])
        await refreshLibrary()
        if (reader.hasBook.value) showingLibrary.value = false
    } finally {
        input.value = ''
    }
}

async function refreshLibrary(): Promise<void> {
    try {
        libraryBooks.value = await library.listBooks()
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法读取本地书架'
    }
}

async function openLibraryBook(id: string): Promise<void> {
    try {
        const opened = await reader.openLibraryBook(id)
        if (!opened) {
            reader.errorMessage.value = '书籍已不存在，请刷新书架'
            await refreshLibrary()
            return
        }
        showingLibrary.value = false
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法打开书籍'
    }
}

async function removeLibraryBook(id: string): Promise<void> {
    if (!window.confirm('确定从本地书架移除这本书吗？')) return

    try {
        await library.removeBook(id)
        await refreshLibrary()
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法移除书籍'
    }
}

async function changeMode(nextMode: PresentationMode): Promise<void> {
    try {
        await showing.setMode(nextMode)
        mode.value = showing.mode
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法切换窗口模式'
    }
}

function openSettings(): void {
    if (mode.value === 'stealth') return
    settingsOpen.value = true
}

function openLibrary(): void {
    showingLibrary.value = true
    void refreshLibrary()
}

function openReading(): void {
    if (reader.hasBook.value) showingLibrary.value = false
}

async function applyShortcuts(nextBindings: ShortcutBindings): Promise<void> {
    isSavingShortcuts.value = true
    try {
        if (isTauri()) {
            const previousBindings = { ...shortcutBindings.value }
            shortcutStatusBindings.value = { ...nextBindings }
            const result = await registerShortcutBindings(
                globalShortcutApi,
                nextBindings,
                onGlobalShortcut,
                activeShortcutBindings.value,
            )
            shortcutStatuses.value = result.statuses
            activeShortcutBindings.value = result.activeBindings
            if (!result.applied) return
            try {
                await saveShortcutBindings(shortcutStore ?? new LazyStore('settings.json'), nextBindings)
            } catch (error) {
                const rollback = await registerShortcutBindings(globalShortcutApi, previousBindings, onGlobalShortcut, nextBindings)
                shortcutStatuses.value = rollback.statuses
                activeShortcutBindings.value = rollback.activeBindings
                shortcutStatusBindings.value = { ...previousBindings }
                shortcutBindings.value = { ...previousBindings }
                throw error
            }
        } else {
            localStorage.setItem('shortcuts', JSON.stringify(nextBindings))
            shortcutStatuses.value = Object.fromEntries(
                Object.keys(nextBindings).map((action) => [action, 'registered']),
            ) as ShortcutStatuses
            shortcutStatusBindings.value = { ...nextBindings }
        }
        shortcutBindings.value = { ...nextBindings }
        settingsOpen.value = false
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '保存快捷键失败'
    } finally {
        isSavingShortcuts.value = false
    }
}

async function jumpToPage(value: string): Promise<void> {
    const page = parsePageNumber(value, reader.totalPages.value)
    if (page === null) {
        reader.errorMessage.value = `请输入 1 到 ${reader.totalPages.value} 之间的页码`
        return
    }

    reader.errorMessage.value = ''
    await reader.showPage(page)
}

async function startWindowDrag(event: MouseEvent): Promise<void> {
    if (mode.value !== 'stealth' || !event.altKey || event.button !== 0 || !isTauri()) return
    event.preventDefault()
    event.stopPropagation()
    try {
        await getCurrentWindow().startDragging()
    } catch (error) {
        reader.errorMessage.value = error instanceof Error ? error.message : '无法拖动窗口'
    }
}
</script>

<template>
    <main class="reader-shell" :class="`reader-shell--${mode}`" @mousedown="startWindowDrag">
        <header class="topbar">
            <div class="brand-lockup" aria-label="Vscrebook">
                <span class="brand-mark">阅</span>
                <span class="brand-name">Vscrebook</span>
            </div>

            <nav class="main-navigation" aria-label="主导航">
                <button type="button" :aria-current="showingLibrary ? 'page' : undefined" @click="openLibrary">书架</button>
                <button type="button" :aria-current="!showingLibrary && reader.hasBook.value ? 'page' : undefined" :disabled="!reader.hasBook.value" @click="openReading">阅读</button>
                <button type="button" @click="openSettings">选项</button>
            </nav>

            <div class="topbar-center">
                <span class="current-title">{{ reader.sourceName.value || '尚未打开书籍' }}</span>
                <span v-if="reader.hasBook.value" class="page-indicator">
                    {{ reader.currentPage.value }} / {{ reader.totalPages.value }}
                </span>
            </div>

            <div class="mode-switch" role="group" aria-label="窗口模式">
                <button type="button" :aria-pressed="mode === 'normal'" @click="changeMode('normal')">普通</button>
                <button
                    type="button"
                    :aria-pressed="mode === 'stealth'"
                    :disabled="isTauri() && !activeShortcutBindings.toggleMode"
                    @click="changeMode('stealth')"
                >摸鱼</button>
                <span class="shortcut-hint">{{ shortcutBindings.toggleMode }}</span>
            </div>
        </header>

        <LibraryView
            v-if="showingLibrary && mode === 'normal'"
            :books="libraryBooks"
            :error-message="reader.errorMessage.value"
            @import-books="fileInput?.click()"
            @open-book="openLibraryBook"
            @remove-book="removeLibraryBook"
        />
        <ReaderView
            v-else
            ref="readerView"
            :has-book="reader.hasBook.value"
            :source-name="reader.sourceName.value"
            :source-text="reader.sourceText.value"
            :book-id="reader.bookId.value"
            :progress-offset="reader.progressOffset.value"
            :current-page="reader.currentPage.value"
            :total-pages="reader.totalPages.value"
            :progress="reader.progress.value"
            :error-message="reader.errorMessage.value"
            @open-book="fileInput?.click()"
            @show-library="openLibrary"
            @page="reader.showPage"
            @layout="reader.setPageLayout"
            @jump-page="jumpToPage"
        />

        <input
            ref="fileInput"
            class="visually-hidden"
            type="file"
            accept=".txt,text/plain"
            @change="openFile"
        />
        <ShortcutSettings
            v-if="settingsOpen && mode === 'normal'"
            :bindings="shortcutBindings"
            :status-bindings="shortcutStatusBindings"
            :statuses="shortcutStatuses"
            :saving="isSavingShortcuts"
            @apply="applyShortcuts"
            @close="settingsOpen = false"
        />
    </main>
</template>
