import { detectFileSync } from 'chardet'
import { readFileSync, writeFileSync } from 'fs'
import { decode, encode } from 'iconv-lite'
import _ = require('lodash')
import { format, parse } from 'path'

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

export function setExtTo(path: string, ext: string) {
    let extTmp = parse('a.' + _.trim(ext)).ext
    let pathTmp = parse(path)
    pathTmp.base = ''
    pathTmp.ext = extTmp
    let res = format(pathTmp)
    if (!_.endsWith(res, '.txt')) {
        res += '.txt'
    }
    return res
}
