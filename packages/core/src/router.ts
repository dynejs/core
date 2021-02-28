import * as express from 'express'
import * as hbs from 'hbs'
import * as methods from 'methods'
import _debug = require('debug')
import { Express, IRouter } from 'express'
import { Constructable, Middleware } from './types'
import { Container } from './container'
import { Injectable } from './decorators/injectable'
import { Views } from './views/views'
import { asyncWrap, isClass } from './utils'
import { vendor } from './middleware'
import { setRenderPage } from './middleware/set-render-page'
import { setIsJson } from './middleware/set-is-json'
import { errorHandler } from './error-handler'

const debug = _debug('dyne:core:router')

export interface IRouteDefinition {
    cls: Constructable
    handler: any
    method: string
    path: string
    middleware: Middleware[],
    request?: Constructable
}

export interface MiddlewareDef {
    path: string
    handler: Middleware
    cls: Constructable
}

export interface StaticDef {
    route: string
    path: string
    opts: any
}

@Injectable()
export class Router {

    routes: IRouteDefinition[]
    middleware: MiddlewareDef[]
    statics: StaticDef[]
    container: Container
    app: Express

    constructor(container: Container) {
        this.app = express()
        this.container = container
        this.routes = []
        this.middleware = []
        this.statics = []
    }

    use(handler: Middleware | Constructable)

    use(path: string, handler?: Middleware | Constructable)

    use(path, handler?) {
        if (!handler && typeof path === 'function') {
            handler = path
            path = null
        }
        const def: MiddlewareDef = {
            path: path,
            handler: null,
            cls: null
        }
        if (isClass(handler)) {
            def.handler = null
            def.cls = handler
        } else {
            def.handler = handler
            def.cls = null
        }
        this.middleware.push(def)
    }

    static(route: string, path?: string, opts?: any) {
        if (!path) {
            path = route
            route = null
        }
        this.statics.push({
            path,
            route,
            opts
        })
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

        hbs.localsAsTemplateData(this.app)
        this.app.engine('hbs', hbs.__express)
        this.app.set('view engine', 'hbs')
        this.app.set('views', this.container.resolve(Views).get())

        // Bind assets middleware first
        this.statics.forEach(def => {
            const mw = express.static(def.path, def.opts)
            const params = def.route
                ? [def.route, mw]
                : [mw]

            this.app.use.apply(this.app, params)
        })

        // Core middleware functions
        this.app.use(vendor())
        this.app.use(setIsJson())
        this.app.use(setRenderPage())

        // Bind middleware functions
        this.middleware.forEach(middleware => {
            let handler = null
            if (middleware.cls) {
                const instance: any = this.container.resolve(middleware.cls)
                handler = asyncWrap(instance.handle.bind(instance))
            } else {
                handler = asyncWrap(middleware.handler)
            }
            const params = middleware.path
                ? [middleware.path, handler]
                : [handler]
            this.app.use.apply(this.app, params)
        })

        // Bind routes
        this.routes.map(route => {
            expressRouter[route.method](route.path, route.middleware, route.handler)
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
