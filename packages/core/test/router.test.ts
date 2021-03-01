import * as assert from 'assert'
import { Container, Get, Router } from '../src'

const container = new Container()

function testMiddleware() {
    return (req, res, next) => {}
}

class Controller {
    @Get('/')
    index() {}
}

before(() => {
    container.register(Router)
})

describe('Router', () => {
    it('should register a controller', function () {
        const router = container.resolve(Router)
        assert(router instanceof Router)
    })

    it('should register a middleware', function () {
        const router = container.resolve(Router)
        router.use(testMiddleware())
        assert(typeof router.middleware[0].handler === 'function')
    })

    it('should register a controller', function () {
        const router = container.resolve(Router)
        router.controller(Controller)
        assert(typeof router.routes[0].handler === 'function')
        assert(router.routes[0].cls.name === 'Controller')
    })
})
