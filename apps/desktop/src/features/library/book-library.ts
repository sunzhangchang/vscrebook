export interface LibraryBook {
    id: string
    name: string
    text: string
    importedAt: number
    lastOpenedAt: number
    progressOffset: number
}

interface BookLibraryOptions {
    indexedDB?: IDBFactory
    createId?: () => string
    now?: () => number
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error ?? new Error('读取书库失败'))
    })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onabort = () => reject(transaction.error ?? new Error('书库操作失败'))
        transaction.onerror = () => reject(transaction.error ?? new Error('书库操作失败'))
    })
}

export class BookLibrary {
    private readonly indexedDB: IDBFactory
    private readonly createId: () => string
    private readonly now: () => number
    private database: Promise<IDBDatabase> | undefined

    constructor(options: BookLibraryOptions = {}) {
        this.indexedDB = options.indexedDB ?? globalThis.indexedDB
        this.createId = options.createId ?? (() => crypto.randomUUID())
        this.now = options.now ?? (() => Date.now())
    }

    async importBook(name: string, text: string): Promise<LibraryBook> {
        const importedAt = this.now()
        const book: LibraryBook = {
            id: this.createId(),
            name,
            text,
            importedAt,
            lastOpenedAt: importedAt,
            progressOffset: 0,
        }
        const database = await this.openDatabase()
        const transaction = database.transaction('books', 'readwrite')
        const done = transactionDone(transaction)
        transaction.objectStore('books').add(book)
        await done
        return book
    }

    async listBooks(): Promise<LibraryBook[]> {
        const database = await this.openDatabase()
        const transaction = database.transaction('books', 'readonly')
        const done = transactionDone(transaction)
        const books = await requestResult(transaction.objectStore('books').getAll()) as LibraryBook[]
        await done
        return books.sort((first, second) => second.lastOpenedAt - first.lastOpenedAt)
    }

    async getBook(id: string): Promise<LibraryBook | undefined> {
        const database = await this.openDatabase()
        const transaction = database.transaction('books', 'readonly')
        const done = transactionDone(transaction)
        const book = await requestResult(transaction.objectStore('books').get(id)) as LibraryBook | undefined
        await done
        return book
    }

    async saveProgress(id: string, progressOffset: number): Promise<void> {
        const database = await this.openDatabase()
        const transaction = database.transaction('books', 'readwrite')
        const done = transactionDone(transaction)
        const store = transaction.objectStore('books')
        const book = await requestResult(store.get(id)) as LibraryBook | undefined
        if (book) {
            book.progressOffset = Math.max(0, Math.floor(progressOffset))
            book.lastOpenedAt = this.now()
            store.put(book)
        }
        await done
    }

    async removeBook(id: string): Promise<void> {
        const database = await this.openDatabase()
        const transaction = database.transaction('books', 'readwrite')
        const done = transactionDone(transaction)
        transaction.objectStore('books').delete(id)
        await done
    }

    private openDatabase(): Promise<IDBDatabase> {
        if (this.database) return this.database

        this.database = new Promise((resolve, reject) => {
            const request = this.indexedDB.open('vscrebook-desktop-library', 1)
            request.onupgradeneeded = () => {
                request.result.createObjectStore('books', { keyPath: 'id' })
            }
            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error ?? new Error('无法打开本地书库'))
        })
        return this.database
    }
}
