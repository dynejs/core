import { TestCommand } from '../commands/test-command'

export class TestCommandHandler {

    async handle(command: TestCommand) {
        if (typeof command.id === 'string') {
            throw new Error('Command should fail')
        }
        return command.id + ' handled'
    }
}
