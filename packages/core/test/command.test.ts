import * as assert from 'assert'
import 'reflect-metadata'
import { CommandHandler } from '../src/decorators/command-handler'
import { Command, ICommand } from '../src/command'
import { Container } from '../src'

@CommandHandler('some-command')
class SomeCommand implements ICommand {
    handle(opts) {
        return opts.param
    }
}

let container: Container = null
let cnsl: Command = null

before(() => {
    container = new Container()
    container.register(Command)
    cnsl = container.resolve(Command)
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
