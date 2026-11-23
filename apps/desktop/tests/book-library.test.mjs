import assert from 'node:assert/strict'
import test from 'node:test'
import { IDBFactory } from 'fake-indexeddb'
import { BookLibrary } from '../src/features/library/book-library.ts'

function createLibrary() {
    let nextId = 1
    let now = 100
    const library = new BookLibrary({
        indexedDB: new IDBFactory(),
        createId: () => `book-${nextId++}`,
        now: () => now,
    })
    return { library, setNow: (value) => { now = value } }
}

test('imports full text into a local library and lists newest books first', async () => {
    const { library, setNow } = createLibrary()
    const first = await library.importBook('第一本', '第一本正文')
    setNow(200)
    const second = await library.importBook('第二本', '第二本正文')

    assert.equal((await library.getBook(first.id)).text, '第一本正文')
    assert.deepEqual((await library.listBooks()).map(({ id }) => id), [second.id, first.id])
})

test('updates reading offset and last-opened time', async () => {
    const { library, setNow } = createLibrary()
    const book = await library.importBook('书名', '长篇正文')
    setNow(300)

    await library.saveProgress(book.id, 1440)

    assert.equal((await library.getBook(book.id)).progressOffset, 1440)
    assert.equal((await library.getBook(book.id)).lastOpenedAt, 300)
})

test('removes a book from the library', async () => {
    const { library } = createLibrary()
    const book = await library.importBook('待删除', '正文')

    await library.removeBook(book.id)

    assert.equal(await library.getBook(book.id), undefined)
    assert.deepEqual(await library.listBooks(), [])
})
