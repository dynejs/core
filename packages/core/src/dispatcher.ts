import { Injectable } from './decorators/injectable'
import { Container } from './container'
import { Constructable } from './types'
import { Autoload } from './autoload'

export interface IDispatcher {
    handle(...args: any[]): Promise<any> | any
}

@Injectable()
export class Dispatcher {

    handlers: Map<string, Constructable<IDispatcher>>

    constructor(public container: Container) {
        this.handlers = new Map()
    }

    register(command: Constructable, handler: Constructable<IDispatcher>) {
        this.handlers.set(command.name, handler)
    }

    async dispatch(cls: any): Promise<any> {
        const handler = this.getHandler(cls)
        const resolved = this.container.resolve(handler)

        if (typeof cls.validate === 'function') {
            cls.validate()
        }

        return resolved.handle(cls)
    }

    mapHandlers(commandsPath: string, handlersPath: string) {
        const commands = Autoload.load(commandsPath)
        const handlers = Autoload.load(handlersPath)

        Object.keys(commands).forEach(commandName => {
            const handler = handlers[commandName + 'Handler']

            if (!handler) {
                throw new Error('No handler defined for command: ' + commandName)
            }

            this.register(commands[commandName], handlers[commandName + 'Handler'])
        })
    }

    private getHandler(command: any): Constructable {
        const handler = this.handlers.get(command.constructor.name)

        if (!handler) {
            throw new Error('No handler registered for command: ' + command.constructor.name)
        }

        return handler
    }
}
