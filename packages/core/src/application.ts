import * as express from 'express'
import * as path from 'path'
import { Server as HttpServer } from 'http'
import { BaseProvider } from './internal/base'
import { Constructable, Middleware } from './types'
import { Router } from './router'
import { Container } from './container'
import { Provider } from './provider'

export class App extends Container {

    hooks: (() => void)[]
    registeredProviders: Provider[]
    opts: any

    constructor(providers: Constructable[] = []) {
        super()

        this.hooks = []
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
        })
    }

    afterBoot(fn) {
        this.hooks.push(fn)
    }

    static(route: string, path?: string) {
        this.resolve(Router).static(route, path)
    }

    basePath(given) {
        return path.resolve(path.join(this.opts.root, given))
    }

    use(middleware: Middleware) {
        this.resolve(Router).use(middleware)
    }

    useCls(middleware: Constructable) {
        this.resolve(Router).useCls(middleware)
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
