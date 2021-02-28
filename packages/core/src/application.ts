import * as path from 'path'
import * as express from 'express'
import { Server as HttpServer } from 'http'
import { BaseProvider } from './internal/base'
import { Constructable, Middleware } from './types'
import { Router } from './router'
import { Container } from './container'
import { Provider } from './provider'
import { Command, ICommand } from './command'

export class App extends Container {

    registeredProviders: Provider[]
    opts: any
    hooks: (() => void)[]
    cliHooks: ((app: App) => void)[]

    constructor(providers: Constructable[] = []) {
        super()

        this.hooks = []
        this.cliHooks = []
        this.registeredProviders = []
        this.opts = {
            root: process.cwd()
        }

        this.registerBaseProviders(providers)

        this.boot()
    }

    registerBaseProviders(providers: Constructable<Provider>[]) {
        this.registerProvider(BaseProvider)

        providers.forEach(provider => {
            this.registerProvider(provider)
        })
    }

    async bootRegisteredProviders() {
        for(const provider of this.registeredProviders) {
            if (provider.boot) {
                await provider.boot()
            }
        }
    }

    registerProvider(provider: Constructable<Provider>) {
        const instance = new provider(this)

        if (instance.register) {
            instance.register()
        }

        this.registeredProviders.push(instance)
    }

    boot() {
        this.bootRegisteredProviders().then(() => {
            this.resolve(Router).bind()
            // Run hooks
            this.hooks.map(fn => fn())
            this.cliHooks.map(fn => fn(this))
        })
    }

    cli(callback: () => void) {
        this.cliHooks.push(callback)
    }

    afterBoot(fn) {
        this.hooks.push(fn)
    }

    static(route: string, path?: string) {
        this.resolve(Router).static(route, path)
    }

    staticMiddleware(...args) {
        return express.static.apply(null, args)
    }

    basePath(given) {
        return path.resolve(path.join(this.opts.root, given))
    }

    use(path: Middleware)

    use(path: string, middleware?: Middleware)

    use(path, middleware?) {
        this.resolve(Router).use(path, middleware)
    }

    useCls(path: Constructable)

    useCls(path: string, middleware?: Constructable)

    useCls(path, middleware?) {
        this.resolve(Router).useCls(path, middleware)
    }

    registerCommand(command: Constructable<ICommand>) {
        this.resolve(Command).register(command)
    }

    listen(opts: any = {}) {
        const app = this.resolve(Router).getApp()
        app.set('port', opts.port || 3000)

        const port = opts.port || process.env.PORT || '3000'
        const server = new HttpServer(app)

        server.on('error', err => {
            throw err
        })

        server.on('listening', () => {
            console.log('Listening on port:' + port)
        })

        server.listen(port)

    }
}
