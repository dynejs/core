import * as minimist from 'minimist'
import { Constructable } from './types'
import { Container } from './container'
import { COMMAND_METADATA } from './decorators/command'
import { Injectable } from './decorators/injectable'

export interface ICommand {
    handle: (opts: any) => Promise<void>
}

@Injectable()
export class CommandService {

    commands: Map<string, Constructable<ICommand>>
    container: Container

    constructor(container: Container) {
        this.container = container
        this.init()
    }

    init() {
        this.commands = new Map<string, Constructable<ICommand>>()
    }

    register(command: Constructable<ICommand>) {
        const signature = this.getSignature(command)
        this.commands.set(signature, command)
    }

    get(signature: string) {
        const command = this.commands.get(signature)
        if (!command) {
            throw new Error('No command registered with signature: ' + signature)
        }
        return command
    }

    run(args): Promise<any> {
        args = args.split(' ') || process.argv.slice(2)
        const parsed = minimist(args)

        const command = this.get((parsed._ || [])[0])
        const handler = this.container.resolve(command)

        return handler.handle(parsed)
    }

    private getSignature(cls: Constructable): string {
        const metadata = Reflect.getOwnMetadata(COMMAND_METADATA, cls)
        if (!metadata) {
            throw new Error('Console commands must use @Command with a signature')
        }
        return metadata.signature
    }
}
