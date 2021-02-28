import * as assert from 'assert'
import 'reflect-metadata'
import { Command } from '../src/decorators/command'
import { CommandService, ICommand } from '../src/command'
import { Container } from '../src'

@Command('some-command')
class SomeCommand implements ICommand {
    handle(opts) {
        return opts.param
    }
}

let container: Container = null
let cnsl: CommandService = null

before(() => {
    container = new Container()
    container.register(CommandService)
    cnsl = container.resolve(CommandService)
})

describe('Console', () => {
    it('should register a new command', function () {
        cnsl.register(SomeCommand)
        const resolved = cnsl.get('some-command')
        assert(resolved.name === 'SomeCommand')
    })

    it('should run a registered command', async () => {
        cnsl.init()
        cnsl.register(SomeCommand)
        const result = await cnsl.run('some-command --param someValue')

        assert(result === 'someValue')
    })
})
