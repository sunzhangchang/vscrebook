
import Benchmark from 'benchmark'
import { search as rsSearch } from '../../crawl/pkg/crawl'
import { search as jsSearch } from '../crawl'

export function benchmark() {
    const suite = new Benchmark.Suite()

    suite
        .add('rust wasm', () => { rsSearch('我的') })
        .add('js', () => { jsSearch('我的') })
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
