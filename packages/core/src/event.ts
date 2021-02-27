import { Injectable } from './decorators/injectable'
import { Constructable } from './types'
import { Container } from './container'

@Injectable()
export class Event {

    private listeners: Map<string, Constructable[]>

    private container: Container

    constructor(container: Container) {
        this.container = container
        this.listeners = new Map()
    }

    on(event: string, handler: Constructable) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, [])
        }

        this.listeners.get(event).push(handler)
    }

    off(event: string, handler: Constructable) {
        const handlers = this.listeners.get(event) || []
        this.listeners.set(event, handlers.filter(h => h.name !== handler.name))
    }

    emit(event, payload): void {
        const handlers = this.listeners.get(event) || []

        for (const handler of handlers) {
            this.container.invoke(new handler(payload), 'handle')
        }
    }
}
