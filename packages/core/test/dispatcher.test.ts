import * as assert from 'assert'
import { Container, Dispatcher } from '../src'
import { TestCommand } from './commands/test-command'
import { TestCommandHandler } from './handlers/test-command-handler'

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
        dispatcher.register(TestCommand, TestCommandHandler)
        const value = await dispatcher.dispatch(new TestCommand(10))
        assert(value === '10 handled')
    })

    it('should fail dispatching an action', async () => {
        const dispatcher = container.resolve(Dispatcher)
        dispatcher.register(TestCommand, TestCommandHandler)
        assert.rejects(() => dispatcher.dispatch(new TestCommand('should fail')))
    })

    it('should map commands to handlers', async () => {
        const dispatcher = container.resolve(Dispatcher)
        dispatcher.mapHandlers(__dirname + '/commands', __dirname + '/handlers')
        const value = await dispatcher.dispatch(new TestCommand(10))
        assert(value === '10 handled')
    })
})
