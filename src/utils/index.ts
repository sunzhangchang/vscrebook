import { detectFileSync } from 'chardet'
import { readFile, writeFile } from 'fs/promises'
import { decode, encode } from 'iconv-lite'

export function detect(filePath: string) {
    let decod = detectFileSync(filePath, { sampleSize: 128 })
    if (!decod) {
        throw new Error('当前编码不支持')
    }
    return decod.toString()
}

export async function copyFileToUTF8(oldPath: string, newPath: string, transform: (data: string) => string) {
    let buf = await readFile(oldPath)
    let decod = detect(oldPath)
    let data = decode(buf, decod)
    buf = encode(data, 'utf8')
    data = buf.toString('utf8')
    data = transform(data)
    await writeFile(newPath, data)
}
