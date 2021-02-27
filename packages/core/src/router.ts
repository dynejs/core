import * as express from 'express'
import * as hbs from 'hbs'
import { Express, IRouter } from 'express'
import * as methods from 'methods'
import { asyncWrap } from './utils'

import _debug = require('debug')
import { Constructable, Middleware, Response, Request } from './types'
import { Container } from './container'
import { NextFunction } from 'express'
import { Injectable } from './decorators/injectable'
import { errorHandler } from './error-handler'
import { vendor } from './middleware'
import { Views } from './views/views'
import { setRenderPage } from './middleware/set-render-page'
import { setIsJson } from './middleware/set-is-json'

const debug = _debug('dyne:core:router')

export interface IRouteDefinition {
    cls: Constructable
    handler: any
    method: string
    path: string
    middleware: Middleware[],
    request?: Constructable
}

export interface MiddlewareHandler {
    handle(req: Request, res: Response, next?: NextFunction): Promise<void>
}

@Injectable()
export class Router {

    routes: IRouteDefinition[]
    middleware: Middleware []
    classMiddleware: any[]
    statics: any[]
    groupMiddleware: Middleware[]
    container: Container
    app: Express

    constructor(container: Container) {
        this.app = express()
        this.container = container
        this.routes = []
        this.middleware = []
        this.statics = []
        this.classMiddleware = []
        this.groupMiddleware = []
    }

    use(middleware: Middleware) {
        this.middleware.push(middleware)
    }

    useCls(cls: Constructable) {
        this.classMiddleware.push(cls)
    }

    static(path) {
        this.statics.push(path)
    }

    controller(cls: Constructable) {
        const routes = Reflect.getMetadata('dy:routes', cls) || []
        const mapped = routes.map(route => {
            const resolved = this.container.resolve(route.cls)
            route.handler = resolved[route.handler].bind(resolved)
            return route
        })
        this.routes = this.routes.concat(mapped)
    }

    bind(): any {
        const expressRouter = makeRouter()

        this.app.use(vendor())
        this.app.use(setIsJson())
        this.app.use(setRenderPage())

        hbs.localsAsTemplateData(this.app)
        this.app.engine('hbs', hbs.__express)
        this.app.set('view engine', 'hbs')
        this.app.set('views', this.container.resolve(Views).get())

        this.middleware.forEach(middleware => {
            this.app.use(asyncWrap(middleware))
        })

        this.classMiddleware.forEach(cls => {
            const instance: any = this.container.resolve(cls)
            this.app.use(asyncWrap(instance.handle.bind(instance)))
        })

        this.routes.map(route => {
            expressRouter[route.method](route.path, route.middleware, route.handler)
        })

        this.app.use('/storage', express.static('storage/public'))

        // Early binding, public asset queries will fall through
        // all other routes and middleware
        this.statics.forEach(path => {
            this.app.use(express.static(path))
        })

        this.app.use(expressRouter)

        // Handling errors internally
        this.app.use(errorHandler())
    }

    getApp() {
        return this.app
    }
}

/**
 * Creates a patched express router for handling
 * async-await handlers
 */
export function makeRouter(): IRouter {
    const expressRouter = express.Router()
    const originalRouter = expressRouter.use
    const original = expressRouter.route

    expressRouter.route = function () {
        const route = original.apply(this, arguments)
        methods.map(swapMethod(route))
        return route
    }

    expressRouter.use = function () {
        return originalRouter.apply(this, asyncWrap([...arguments]))
    }

    return expressRouter as IRouter
}

/**
 * Swaps the express router handler fn with an async one
 *
 * @param route
 */
function swapMethod(route) {
    return (method) => {
        const fn = route[method]
        route[method] = function (...args) {
            const newArgs = args.map((v) => {
                if (typeof v === 'function') {
                    return asyncWrap(v)
                }
                if (v === undefined) {
                    throw new Error('Route method is undefined')
                }
                return v
            })
            return fn.apply(this, newArgs)
        }
    }
}
