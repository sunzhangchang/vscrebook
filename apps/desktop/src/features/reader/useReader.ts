import { computed, ref } from 'vue'
import { BookLibrary } from '../library/book-library.ts'
import { getPageForOffset } from './page-layout.ts'

export function useReader(library: BookLibrary) {
    const sourceText = ref('')
    const sourceName = ref('')
    const currentPage = ref(1)
    const errorMessage = ref('')
    const bookId = ref('')
    const totalPages = ref(0)
    const progressOffset = ref(0)

    const hasBook = computed(() => sourceName.value.length > 0)
    const progress = computed(() => totalPages.value <= 1 ? 0 : (currentPage.value - 1) / (totalPages.value - 1) * 100)

    function decodeText(buffer: ArrayBuffer): string {
        try {
            return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
        } catch {
            return new TextDecoder('gb18030').decode(buffer)
        }
    }

    async function openFile(file?: File): Promise<void> {
        if (!file) return

        try {
            errorMessage.value = ''
            const text = decodeText(await file.arrayBuffer())
            const name = file.name.replace(/\.[^.]+$/, '')
            const book = await library.importBook(name, text)
            await openLibraryBook(book.id)
        } catch (error) {
            errorMessage.value = error instanceof Error ? error.message : '无法打开此文件'
        }
    }

    async function showPage(page: number): Promise<void> {
        if (!totalPages.value) return
        currentPage.value = Math.max(1, Math.min(totalPages.value, Math.floor(page)))
        progressOffset.value = getOffsetForPage(currentPage.value, totalPages.value, sourceText.value.length)
        if (bookId.value) await library.saveProgress(bookId.value, progressOffset.value)
    }

    async function setPageLayout(pageCount: number, page: number): Promise<void> {
        const nextPageCount = Math.max(1, pageCount)
        const nextPage = Math.max(1, Math.min(nextPageCount, page))
        if (totalPages.value === nextPageCount && currentPage.value === nextPage) return

        totalPages.value = nextPageCount
        currentPage.value = nextPage
        progressOffset.value = getOffsetForPage(currentPage.value, totalPages.value, sourceText.value.length)
        if (bookId.value) await library.saveProgress(bookId.value, progressOffset.value)
    }

    async function openLibraryBook(id: string): Promise<boolean> {
        const book = await library.getBook(id)
        if (!book) return false

        errorMessage.value = ''
        bookId.value = book.id
        totalPages.value = 0
        currentPage.value = 1
        sourceText.value = book.text
        sourceName.value = book.name
        progressOffset.value = book.progressOffset
        return true
    }

    function getResumePage(pageCount: number): number {
        return getPageForOffset(progressOffset.value, sourceText.value.length, pageCount)
    }

    return {
        sourceName,
        sourceText,
        bookId,
        progressOffset,
        currentPage,
        errorMessage,
        hasBook,
        totalPages,
        progress,
        openFile,
        openLibraryBook,
        showPage,
        setPageLayout,
        getResumePage,
    }
}

function getOffsetForPage(page: number, pageCount: number, textLength: number): number {
    if (pageCount <= 1 || textLength <= 0) return 0
    return Math.floor((page - 1) / (pageCount - 1) * textLength)
}
