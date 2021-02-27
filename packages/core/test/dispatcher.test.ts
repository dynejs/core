import * as assert from 'assert'
import { Container, Dispatcher } from '../src'

let container: Container = null

describe('Dispatcher', () => {
    before(() => {
        container = new Container()
        container.register(Dispatcher)
    })

    it('should resolve dispatcher', function () {
        const dispatcher = container.resolve(Dispatcher)
        assert(dispatcher)
    })

    it('should dispatch an action', async () => {
        const dispatcher = container.resolve(Dispatcher)
        const value = await dispatcher.dispatch(new DummyAction(10))
        assert(value === '10 changed')
    })

    it('should fail dispatching an action', async () => {
        const dispatcher = container.resolve(Dispatcher)
        await assert.rejects(async () => dispatcher.dispatch(new DummyWrongHandler(10) as any))
    })
})

class DummyAction {
    public id: number

    constructor(id: number) {
        this.id = id
    }

    handle() {
        return this.id + ' changed'
    }
}

class DummyWrongHandler {
    public id: number

    constructor(id: number) {
        this.id = id
    }
}
