
import Benchmark from 'benchmark'
import { search as rsSearch } from '../../crawl/pkg/crawl'
import { search as jsSearch } from '../crawl'

export function benchmark() {
    const suite = new Benchmark.Suite()

    suite
        .add('rust wasm', async () => {
            await rsSearch('我的')
        }, {
            async: true,
        })
        .add('js', async () => {
            await jsSearch('我的')
        }, {
            async: true,
        })
        .on('cycle', (event: unknown) => {
            console.log((event as {target: unknown}).target)
        })
        .on('complete', () => {
            console.log('Faster: ' + suite.filter('fastest').map('name'))
        })
        .run({
            name: 'rust vs js',
            async: true,
        })
}
