import * as assert from 'assert'
import { Provider, App } from '../src'

describe('Application', () => {
    it('should create an application with the given provider', function () {
        const app = new App([
            SampleProvider
        ])
        const registered = app.registeredProviders.find(provider => {
            return provider.constructor.name === 'SampleProvider'
        })
        assert(registered)
    })

    it('should boot providers', function () {
        const app = new App([
            SampleProvider
        ])
        const service = app.resolve(SampleService)
        assert(service.doSomething() === 'Hello World', service.doSomething())
    })

    it('should has basic functions on app instance', function () {
        const app = new App()
        const fns = ['static', 'cli', 'basePath', 'use', 'registerCommand']
        for (const fn of fns) {
            assert(typeof app[fn] === 'function')
        }
    })
})

class SampleService {

    data: string

    setSomething() {
        this.data = 'Hello'
    }

    doSomething() {
        return this.data + ' World'
    }
}

class SampleProvider extends Provider {
    register() {
        this.app.register(SampleService)
    }

    boot() {
        const sample = this.app.resolve(SampleService)
        sample.setSomething()
    }
}
