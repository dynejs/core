import * as assert from 'assert'
import * as express from 'express'
import { Router } from '../src'

function testMiddleware() {
    return (req, res, next) => {}
}

class Controller {
    index() {}
}

describe('Router', () => {
    it('should register a controller', function () {
        const router = new Router()

    })

    it('should register a middleware', function () {
        const router = new Router()
        router.use(testMiddleware())
        assert(typeof router.middleware[0] === 'function')
    })

    it('should bind router to express app', function() {
        const router = new Router()
        const app = express()
        router.bind(app)
        assert(app._router)
    })
})
