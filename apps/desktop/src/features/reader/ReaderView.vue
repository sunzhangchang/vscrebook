<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createLeadingTrailingTask, getPageAfterResize, getPageCount, getPageForOffset, subscribeToViewportResize } from './page-layout'

const props = defineProps<{
    hasBook: boolean
    sourceName: string
    sourceText: string
    bookId: string
    progressOffset: number
    currentPage: number
    totalPages: number
    progress: number
    errorMessage: string
}>()

const emit = defineEmits<{
    openBook: []
    showLibrary: []
    page: [page: number]
    layout: [pageCount: number, page: number]
    jumpPage: [page: string]
}>()

const jumpInput = ref<HTMLInputElement>()
const readingPage = ref<HTMLElement>()
const pageContent = ref<HTMLElement>()
const jumpValue = ref(String(props.currentPage))
let resizeObserver: ResizeObserver | undefined
let unsubscribeViewportResize: (() => void) | undefined
let previousPageCount = 0
let previousBookId = props.bookId
const resizeLayout = createLeadingTrailingTask(measurePageLayout, 50)

watch(() => props.currentPage, (page) => {
    jumpValue.value = String(page)
    nextTick(scrollToCurrentPage)
})

watch(() => [props.sourceText, props.bookId], () => {
    previousBookId = props.bookId
    previousPageCount = 0
    nextTick(measurePageLayout)
}, { flush: 'post' })

function measurePageLayout(): void {
    const page = readingPage.value
    const content = pageContent.value
    if (!page || !content || content.clientWidth <= 0 || content.clientHeight <= 0) return

    content.style.columnWidth = `${content.clientWidth}px`
    const pageCount = getPageCount(content.scrollWidth, content.clientWidth)
    const bookChanged = previousBookId !== props.bookId
    const targetPage = bookChanged || previousPageCount === 0
        ? getPageForOffset(props.progressOffset, props.sourceText.length, pageCount)
        : getPageAfterResize(props.currentPage, previousPageCount, pageCount)

    previousBookId = props.bookId
    const layoutChanged = pageCount !== previousPageCount || targetPage !== props.currentPage
    previousPageCount = pageCount
    if (layoutChanged) emit('layout', pageCount, targetPage)
    nextTick(() => {
        page.scrollLeft = (targetPage - 1) * content.clientWidth
    })
}

function scrollToCurrentPage(): void {
    if (!readingPage.value || !pageContent.value) return
    readingPage.value.scrollLeft = (props.currentPage - 1) * pageContent.value.clientWidth
}

async function focusJumpPage(): Promise<void> {
    await nextTick()
    jumpInput.value?.focus()
    jumpInput.value?.select()
}

defineExpose({ focusJumpPage })

onMounted(() => {
    unsubscribeViewportResize = subscribeToViewportResize(window, window.visualViewport, resizeLayout.schedule)
    if (!pageContent.value) return
    resizeObserver = new ResizeObserver(resizeLayout.schedule)
    resizeObserver.observe(pageContent.value)
    if (readingPage.value) resizeObserver.observe(readingPage.value)
    nextTick(measurePageLayout)
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    unsubscribeViewportResize?.()
    resizeLayout.cancel()
})
</script>

<template>
    <section v-if="hasBook" class="reading-layout" aria-label="阅读区域">
        <div class="reading-toolbar">
            <button class="quiet-button" type="button" @click="emit('showLibrary')">返回书架</button>
            <button class="quiet-button" type="button" @click="emit('openBook')">导入 TXT</button>
            <span class="encoding-note">自动识别 UTF-8 / GB18030</span>
        </div>

        <article ref="readingPage" class="reading-page">
            <h1>{{ sourceName }}</h1>
            <p ref="pageContent">{{ sourceText }}</p>
        </article>

        <footer class="page-controls">
            <button class="page-button" type="button" :disabled="currentPage <= 1" @click="emit('page', currentPage - 1)">
                上一页
            </button>
            <div class="progress-track" role="progressbar" :aria-valuenow="currentPage" :aria-valuemax="totalPages">
                <span :style="{ width: `${progress}%` }"></span>
            </div>
            <form class="jump-control" @submit.prevent="emit('jumpPage', jumpValue)">
                <input
                    ref="jumpInput"
                    v-model="jumpValue"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    aria-label="跳转页码"
                    :disabled="!totalPages"
                />
                <span>/ {{ totalPages }}</span>
                <button class="jump-submit" type="submit" :disabled="!totalPages">跳转</button>
            </form>
            <button class="page-button" type="button" :disabled="currentPage >= totalPages" @click="emit('page', currentPage + 1)">
                下一页
            </button>
        </footer>
        <p v-if="errorMessage" class="error-message floating-error" role="alert">{{ errorMessage }}</p>
    </section>

    <section v-else class="empty-state">
        <div class="empty-state-mark" aria-hidden="true">阅</div>
        <h1>让阅读回到眼前</h1>
        <p>打开本地 TXT 小说，开始阅读。</p>
        <button class="primary-button" type="button" @click="emit('openBook')">打开 TXT 文件</button>
        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
    </section>
</template>
