import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from "fs"
import { decode, encode } from 'iconv-lite'

export const defaultPageSize = 25

export function detect(filePath: string) {
    let decod = detectFileSync(filePath, { sampleSize: 128 })
    if (!decod) {
        throw new Error('当前编码不支持')
    }
    return decod.toString()
}

export function copyFileToUTF8Sync(oldPath: string, newPath: string, transform: (data: string) => string) {
    let buf = readFileSync(oldPath)
    let decod = detect(oldPath)
    let data = decode(buf, decod)
    buf = encode(data, 'utf8')
    data = buf.toString('utf8')
    data = transform(data)
    writeFileSync(newPath, data)
}

export function isUndef(obj: any): boolean {
    return typeof obj === 'undefined'
}

export function isFalse(obj: any): boolean {
    const tp = typeof obj
    if (tp === 'symbol') {
        return true
    } else if (tp === 'bigint' || tp === 'boolean' || tp ==='number' || tp ==='undefined' || tp === 'function') {
        return !tp
    } else if (tp === 'string') {
        return obj.length === 0
    } else if (tp === 'object') {
        return isFalse(Object.keys(obj))
    }
    return false
}