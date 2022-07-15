import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from 'fs'
import { decode, encode } from 'iconv-lite'
import _ from 'lodash'
import { format, parse } from 'path'

export function detect(filePath: string): string {
    const decod = detectFileSync(filePath, { sampleSize: 128 })
    if (!decod) {
        throw new Error('当前编码不支持')
    }
    return decod.toString()
}

export function readFileToUTF8Sync(filePath: string): string {
    return encode(decode(readFileSync(filePath), detect(filePath)), 'utf8').toString('utf8')
}

export function copyFileToUTF8Sync(oldPath: string, newPath: string, transform: (data: string) => string): void {
    writeFileSync(newPath, transform(readFileToUTF8Sync(oldPath)))
}

export function setExtTo(path: string, ext: string): string {
    const extTmp = parse('a.' + _.trim(ext)).ext
    const pathTmp = parse(path)
    pathTmp.base = ''
    pathTmp.ext = extTmp
    let res = format(pathTmp)
    if (!_.endsWith(res, '.txt')) {
        res += '.txt'
    }
    return res
}
