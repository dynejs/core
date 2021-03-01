import * as assert from 'assert'
import { Container, Event, Listener } from '../src'

let container: Container = null
let expect = null

describe('Event', () => {
    before(() => {
        container = new Container()
        container.register(Event)
    })

    it('should register an event', function () {
        const event = container.resolve(Event)
        event.register(DummyListener)
        const listener = event.getListeners()[0]
        assert(listener[0] === 'test.action')
        assert(listener[1][0].name === 'DummyListener')
    })

    it('should emit an event', function () {
        const event = container.resolve(Event)
        event.register(DummyListener)
        event.emit('test.action', {
            id: 'event'
        })
        assert(expect === 'event emitted')
    })
})

@Listener('test.action')
class DummyListener {
    handle(payload: any) {
        expect = payload.id + ' emitted'
    }
}
