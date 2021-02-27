import * as assert from 'assert'
import { Container, Dispatcher, Event } from '../src'

let container: Container = null
let expect = null

describe('Event', () => {
    before(() => {
        container = new Container()
        container.register(Dispatcher)
        container.register(Event)
    })

    it('should emit an event', function () {
        const event = container.resolve(Event)
        event.on('action', DummyHandler)
        event.emit('action', {
            id: 'event'
        })
        assert(expect === 'event emitted')
    })
})

class DummyHandler {
    public id: number

    constructor(payload: any) {
        this.id = payload.id
    }

    handle() {
        expect = this.id + ' emitted'
    }
}
