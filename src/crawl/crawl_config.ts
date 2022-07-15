// // type Pattern = string

// // type MaybeFurther = {
// //     isFurther: boolean
// //     re: Pattern
// // } | null

// // type CrawlConfig = {
// //     sourceURL: string
// //     searchURL: string
// //     menuURL: RegExp
// //     书名: Pattern
// //     作者: Pattern
// //     状态: MaybeFurther | null
// //     分类: MaybeFurther | null
// //     字数: MaybeFurther | null
// //     简介: MaybeFurther | null
// //     最新章节: MaybeFurther | null
// //     最近更新: MaybeFurther | null
// //     pages: Pattern
// //     titles: Pattern
// //     content: Pattern
// // }

// // // Source
// // export const configs: Record<string, CrawlConfig> = {
// //     采墨阁: {
// //         sourceURL: 'https://www.caimoge.net/',
// //         searchURL: 'https://www.caimoge.net/search/?searchkey=%s',
// //         menuURL: /<h3>[\s\S]*<a href="(.+?)">.+?<\/a>.+?<\/h3>/gi,
// //         书名: /<h3>[\s\S]*<a href=".+?">(.+?)<\/a>.+?<\/h3>/gi,
// //         作者: /作者：[\s\S]*<span><a href=".*?" target="_blank" title=".*?">(.+?)<\/a><\/span>/gi,
// //         分类: {
// //             isFurther: false,
// //             re: /小类：[\s\S]*<span>(.+?)<\/span>/gi,
// //         },
// //         字数: {
// //             isFurther: false,
// //             re: /字数：[\s\S]*<span>(.+?)<\/span>/gi,
// //         },
// //         最新章节: {
// //             isFurther: false,
// //             re: /最新章节：[\s\S]*<a href=".+?">(.+?)<\/a>/gi,
// //         },
// //         最近更新: {
// //             isFurther: false,
// //             re: /更新时间：[\s\S]*<span>(.+?)<\/span>/gi,
// //         },
// //         状态: {
// //             isFurther: false,
// //             re: /状态：[\s\S]*<span>(.+?)<\/span>/gi,
// //         },
// //         简介: {
// //             isFurther: false,
// //             re: /<dd class="book_des">(.+?)<\/dd>/gi,
// //         },
// //         pages: /<li><a href="(.+?)" target="_blank" title=".+?">.+? - <\/a><\/li>/gi,
// //         titles: /<li><a href=".+?" target="_blank" title="(.+?)">.+? - <\/a><\/li>/gi,
// //         content: /<div id="content">(.+?)<\/div>/i,
// //     }
// // }

// type E = {
//     from: 'title' | 'href' | 'text' | 'html' | 'further'
//     selector: string
// }

// type CrawlConfig = {
//     sourceURL: string
//     searchURL: string
//     container: E
//     menuURL: E
//     书名: E
//     作者: E
//     状态: E | null
//     分类: E | null
//     字数: E | null
//     简介: E | null
//     最新章节: E | null
//     最近更新: E | null
//     pages: string
//     titles: string
//     content: string
// }

// // // Source
// export const configs: Record<string, CrawlConfig> = {
//     采墨阁: {
//         sourceURL: 'https://www.caimoge.net/',
//         searchURL: 'https://www.caimoge.net/search/?searchkey=%s',
//         container: {
//             from: 'html',
//             selector: '#sitembox > dl',
//         },
//         menuURL: {
//             from: 'href',
//             selector: 'dd:nth-child(2) > h3:nth-child(1) > a',
//         },
//         书名: {
//             from: 'text',
//             selector: 'dd:nth-child(2) > h3 > a:nth-child(1)',
//         },
//         作者: {
//             'dd:nth-child(3) > span:nth-child(1) > a:nth-child(1)'
//         },
//         分类: {
//             isFurther: false,
//             re: /小类：[\s\S]*<span>(.+?)<\/span>/gi,
//         },
//         字数: {
//             isFurther: false,
//             re: /字数：[\s\S]*<span>(.+?)<\/span>/gi,
//         },
//         最新章节: {
//             isFurther: false,
//             re: /最新章节：[\s\S]*<a href=".+?">(.+?)<\/a>/gi,
//         },
//         最近更新: {
//             isFurther: false,
//             re: /更新时间：[\s\S]*<span>(.+?)<\/span>/gi,
//         },
//         状态: {
//             isFurther: false,
//             re: /状态：[\s\S]*<span>(.+?)<\/span>/gi,
//         },
//         简介: {
//             isFurther: false,
//             re: /<dd class="book_des">(.+?)<\/dd>/gi,
//         },
//         pages: /<li><a href="(.+?)" target="_blank" title=".+?">.+? - <\/a><\/li>/gi,
//         titles: /<li><a href=".+?" target="_blank" title="(.+?)">.+? - <\/a><\/li>/gi,
//         content: /<div id="content">(.+?)<\/div>/i,
//     }
// }
