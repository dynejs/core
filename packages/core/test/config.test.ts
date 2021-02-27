import * as assert from 'assert'
import { Config } from '../src'

describe('Config', () => {
    it('should load configuration', function () {
        const config = new Config()
        assert(config.get('service.other') === 'Keep this')
    })

    it('should merge configuration', function () {
        const config = new Config()
        config.merge({ service: { key: 'New value' } })
        assert(config.get('service.key') === 'New value')
    })
})
