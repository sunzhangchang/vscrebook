import { resolve } from 'node:path'
import { rm } from 'node:fs/promises'
import { rolldown } from 'rolldown'
import { wasm } from 'rolldown-plugin-wasm'

const extensionDir = resolve(import.meta.dirname, '..')
const outputDir = resolve(extensionDir, 'dist')
const isDev = process.argv.some((arg) => ['dev', '--dev', '-d'].includes(arg))

const bundle = await rolldown({
    input: resolve(extensionDir, 'src/extension.ts'),
    platform: 'node',
    external: ['vscode'],
    plugins: [wasm({ targetEnv: 'node' })],
    resolve: {
        extensions: ['.ts', '.js'],
        alias: { '../define_in_js': resolve(extensionDir, '../packages/crawl/define_in_js.ts') },
    },
})

await rm(outputDir, { recursive: true, force: true })

await bundle.write({
    dir: outputDir,
    entryFileNames: 'extension.js',
    format: 'es',
    minify: !isDev,
    sourcemap: isDev,
})

await bundle.close()
