import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from 'fs'
import { decode, encode } from 'iconv-lite'
import _ from 'lodash'
import { format, parse } from 'path'
export * from './debug'
export * from './error'

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

export function readBookFile(path: string) {
    if (_.isUndefined(path) || _.isEmpty(path)) {
        return ''
    }
    const data: string = readFileSync(path, 'utf-8')
    const text = _(data)
        .chain()
        .trim()
        .replace(/[\r]+/g, '')
        .replace(/[\t\u3000 ]+/g, ' ')
        .replace(/[\n]+/g, ' ')
        .value()
    return text

}
