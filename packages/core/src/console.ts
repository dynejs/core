import { Command } from 'commander'
import { Constructable } from './types'
import { Container } from './container'

export interface ICommand {
    handle: (program: any, container: Container) => Promise<void>
}

export class Console {

    commands: Map<string, Constructable<ICommand>>

    constructor() {
        this.commands = new Map<string, Constructable<ICommand>>()
    }

    register(command: Constructable<ICommand>) {
        this.commands.set((command as any).signature, command)
    }

    get(signature: string) {
        return this.commands.get(signature)
    }

    run(container: Container): Promise<void> {
        const program = new Command()
        const signature = process.argv[2]
        if (typeof signature !== 'string') {
            return Promise.resolve()
        }

        const command = this.get(signature)

        if (!command) {
            throw new Error(`Command not found for "${signature}" signature`)
        }

        const instance = new command(program)

        program.parse(process.argv)

        return instance.handle(program, container)
    }
}
