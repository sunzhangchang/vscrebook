<script setup lang="ts">
import type { LibraryBook } from './book-library'

defineProps<{ books: LibraryBook[]; errorMessage: string }>()
const emit = defineEmits<{
    importBooks: []
    openBook: [id: string]
    removeBook: [id: string]
}>()

function progress(book: LibraryBook): number {
    if (!book.text.length) return 0
    return Math.min(100, Math.floor(book.progressOffset / book.text.length * 100))
}
</script>

<template>
    <section class="library-view" aria-label="本地书架">
        <header class="library-header">
            <div>
                <p class="library-eyebrow">VS CRebook</p>
                <h1>本地书架</h1>
                <p class="library-description">导入的 TXT 小说保存在此桌面应用中，阅读进度会自动记录。</p>
            </div>
            <button class="primary-button" type="button" @click="emit('importBooks')">导入 TXT</button>
        </header>

        <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
        <div v-if="books.length" class="book-list">
            <article v-for="book in books" :key="book.id" class="book-card">
                <button class="book-open" type="button" @click="emit('openBook', book.id)">
                    <span class="book-cover" aria-hidden="true">阅</span>
                    <span class="book-details">
                        <strong>{{ book.name }}</strong>
                        <span>{{ progress(book) }}% · {{ book.progressOffset ? '继续阅读' : '尚未开始' }}</span>
                    </span>
                    <span class="book-continue">阅读 →</span>
                </button>
                <button class="book-remove" type="button" :aria-label="`从书架移除${book.name}`" @click="emit('removeBook', book.id)">移除</button>
            </article>
        </div>
        <div v-else class="library-empty">
            <span class="library-empty-mark" aria-hidden="true">阅</span>
            <h2>书架还是空的</h2>
            <p>导入一本 TXT 小说，就可以开始阅读并保存进度。</p>
            <button class="quiet-button" type="button" @click="emit('importBooks')">选择文件</button>
        </div>
    </section>
</template>
