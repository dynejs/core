import * as assert from 'assert'
import { Container, Cache, Config } from '../src'

const container = new Container()

let cache: Cache = null
let config: Config

before(() => {
    container.register(Cache)
    cache = container.resolve(Cache)
    cache.flushAll()
    config = container.resolve(Config)
})

describe('Cache', () => {
    it('should add value to cache', async () => {
        const value = await cache.get('some', async () =>{
            return 'value'
        })
        assert(value === 'value')
    })

    it('should flush cache for a given key', async () => {
        const value = await cache.get('some', async () =>{
            return 'value'
        })
        assert(value === 'value')
        await cache.flush('some')
        const final = await cache.get('some')
        assert(final === null)
    })
})
