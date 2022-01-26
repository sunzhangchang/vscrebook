import { crawl } from "../../pkg/crawl"

export function jscrawl(inputUrl: string, downloadPath: string) {
    return crawl(inputUrl, downloadPath)
}