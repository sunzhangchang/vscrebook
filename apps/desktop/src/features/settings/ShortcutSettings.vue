<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
    DEFAULT_SHORTCUTS,
    findShortcutConflicts,
    normalizeShortcut,
    type ShortcutAction,
    type ShortcutBindings,
    type ShortcutStatuses,
} from './shortcut-bindings'
import { shortcutFromKeyboardEvent } from './shortcut-format.ts'

const props = defineProps<{
    bindings: ShortcutBindings
    statusBindings: ShortcutBindings
    statuses: ShortcutStatuses
    saving: boolean
}>()

const emit = defineEmits<{
    apply: [bindings: ShortcutBindings]
    close: []
}>()

const labels: Record<ShortcutAction, string> = {
    toggleMode: '切换普通 / 摸鱼模式',
    previousPage: '上一页',
    nextPage: '下一页',
    jumpPage: '跳转页码',
    openBook: '打开 TXT 文件',
}

const draft = ref<ShortcutBindings>({ ...props.bindings })
const recording = ref<ShortcutAction | null>(null)
const captureError = ref('')
const conflicts = computed(() => findShortcutConflicts(draft.value))
const hasInvalidBinding = computed(() => Object.values(draft.value).some((value) => !normalizeShortcut(value)))

watch(() => props.bindings, (bindings) => {
    draft.value = { ...bindings }
}, { deep: true })

function resetDefaults(): void {
    draft.value = { ...DEFAULT_SHORTCUTS }
    captureError.value = ''
}

function onCapture(event: KeyboardEvent): void {
    if (!recording.value) return
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return
    if (event.key === 'Escape') {
        recording.value = null
        captureError.value = ''
        return
    }
    event.preventDefault()
    event.stopPropagation()

    const shortcut = shortcutFromKeyboardEvent(event)
    if (!shortcut) {
        captureError.value = '请使用至少包含一个修饰键的组合键'
        return
    }

    draft.value[recording.value] = shortcut
    recording.value = null
    captureError.value = ''
}

function statusText(action: ShortcutAction): string {
    const duplicateWith = conflicts.value[action]
    if (duplicateWith?.length) return `与「${duplicateWith.map((item) => labels[item]).join('、')}」重复`
    const matchesLastAttempt = normalizeShortcut(draft.value[action]) === normalizeShortcut(props.statusBindings[action])
    if (matchesLastAttempt && props.statuses[action] === 'conflict') return '系统快捷键注册失败，可能与其他程序冲突'
    if (matchesLastAttempt && props.statuses[action] === 'registered') return '全局有效'
    if (matchesLastAttempt && props.statuses[action] === 'not-applied') return '未应用'
    if (!matchesLastAttempt) return '待应用'
    return '尚未注册'
}

onMounted(() => window.addEventListener('keydown', onCapture, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onCapture, true))

defineExpose({ resetDefaults })
</script>

<template>
    <div class="settings-backdrop" @click.self="emit('close')">
        <section class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <header class="settings-header">
                <div>
                    <p class="settings-eyebrow">VSCR EBOOK</p>
                    <h2 id="settings-title">选项</h2>
                </div>
                <button class="settings-close" type="button" aria-label="关闭选项" @click="emit('close')">×</button>
            </header>

            <p class="settings-description">快捷键在应用未聚焦时也有效。选择“录入”后按下新的组合键。</p>

            <div class="shortcut-list">
                <div v-for="(label, action) in labels" :key="action" class="shortcut-row">
                    <div class="shortcut-meta">
                        <span class="shortcut-label">{{ label }}</span>
                        <span
                            class="shortcut-status"
                            :class="{
                                'shortcut-status--conflict': conflicts[action] || statuses[action] === 'conflict',
                                'shortcut-status--active': statuses[action] === 'registered' && !conflicts[action],
                            }"
                        >{{ statusText(action) }}</span>
                    </div>
                    <div class="shortcut-editor">
                        <kbd>{{ recording === action ? '按下组合键…' : draft[action] }}</kbd>
                        <button
                            type="button"
                            :class="{ 'record-button--active': recording === action }"
                            @click="recording = action; captureError = ''"
                        >{{ recording === action ? '录入中' : '录入' }}</button>
                    </div>
                </div>
            </div>

            <p v-if="captureError" class="settings-error" role="alert">{{ captureError }}</p>
            <p v-else-if="hasInvalidBinding" class="settings-error" role="alert">存在无法识别的快捷键，请重新录入。</p>

            <footer class="settings-footer">
                <button class="settings-reset" type="button" @click="resetDefaults">恢复默认</button>
                <div class="settings-actions">
                    <button class="settings-cancel" type="button" @click="emit('close')">取消</button>
                    <button
                        class="settings-apply"
                        type="button"
                        :disabled="saving || hasInvalidBinding || Object.keys(conflicts).length > 0"
                        @click="emit('apply', { ...draft })"
                    >{{ saving ? '正在应用…' : '应用快捷键' }}</button>
                </div>
            </footer>
        </section>
    </div>
</template>
