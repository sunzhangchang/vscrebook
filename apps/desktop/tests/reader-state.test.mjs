import assert from 'node:assert/strict'
import test from 'node:test'
import { useReader } from '../src/features/reader/useReader.ts'

function makeLibrary() {
    const books = new Map()
    const savedProgress = []
    return {
        books,
        savedProgress,
        async importBook(name, text) {
            const book = { id: 'book-1', name, text, importedAt: 1, lastOpenedAt: 1, progressOffset: 0 }
            books.set(book.id, book)
            return book
        },
        async getBook(id) { return books.get(id) },
        async saveProgress(id, offset) {
            savedProgress.push({ id, offset })
            const book = books.get(id)
            if (book) book.progressOffset = offset
        },
    }
}

test('reader restores and saves progress against the measured page count', async () => {
    const library = makeLibrary()
    const reader = useReader(library)
    const text = '长篇正文'.repeat(500)
    const file = {
        name: '小说.txt',
        async arrayBuffer() { return new TextEncoder().encode(text).buffer },
    }

    await reader.openFile(file)
    assert.equal(reader.sourceName.value, '小说')
    assert.equal(reader.sourceText.value, text)
    assert.equal(reader.totalPages.value, 0)

    library.books.get('book-1').progressOffset = Math.floor(text.length / 2)
    await reader.openLibraryBook('book-1')
    await reader.setPageLayout(9, reader.getResumePage(9))
    assert.equal(reader.currentPage.value, 5)
    assert.equal(reader.progressOffset.value, Math.floor(text.length / 2))
    await reader.showPage(9)
    assert.equal(reader.progressOffset.value, text.length)
    assert.equal(library.savedProgress.at(-1).offset, text.length)
})
