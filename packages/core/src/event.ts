import { Injectable } from './decorators/injectable'
import { Constructable, Handler } from './types'
import { Container } from './container'
import { LISTENER_METADATA } from './decorators/listener'

export interface ListenerMetadata {
    event: string
}

@Injectable()
export class Event {

    private listeners: Map<string, Constructable<Handler>[]>

    private container: Container

    constructor(container: Container) {
        this.container = container
        this.listeners = new Map()
    }

    register(listener: Constructable) {
        const event: ListenerMetadata = Reflect.getMetadata(LISTENER_METADATA, listener)
        if (!event) {
            throw new Error('Event listener must use @Listener with the corresponding event key')
        }
        const listeners = this.listeners.get(event.event) || []
        listeners.push(listener)

        this.listeners.set(event.event, listeners)
    }

    emit(event, payload): void {
        const handlers = this.listeners.get(event) || []

        for (const handler of handlers) {
            const resolved = this.container.resolve(handler)
            resolved.handle(payload)
        }
    }

    getListeners(event?: string) {
        if (event) {
            return this.listeners.get(event)
        }
        return Array.from(this.listeners)
    }
}
