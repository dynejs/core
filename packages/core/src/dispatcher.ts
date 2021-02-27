import { Injectable } from './decorators/injectable'
import { Container } from './container'
import { Constructable } from './types'

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

        if(typeof cls.validate === 'function') {
            cls.validate()
        }

        return resolved.handle(cls)
    }

    private getHandler(command: any): Constructable {
        return this.handlers.get(command.constructor.name)
    }
}
