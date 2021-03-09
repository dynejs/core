import * as path from 'path'
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

    constructor(providers: Constructable[] = []) {
        super()
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

    bootRegisteredProviders() {
        for(const provider of this.registeredProviders) {
            if (provider.boot) {
                provider.boot()
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
        this.bootRegisteredProviders()
        this.resolve(Router).bind()
    }

    cli() {
        const command = this.resolve(Command)
        command
            .run()
            .then(() => {
                process.exit(0)
            })
            .catch(() => {
                process.exit(0)
            })
    }

    static(route: string, path?: string) {
        this.resolve(Router).static(route, path)
    }

    basePath(given) {
        return path.resolve(path.join(this.opts.root, given))
    }

    use(path: Middleware)

    use(path: string, middleware?: Middleware)

    use(path, middleware?) {
        this.resolve(Router).use(path, middleware)
    }

    registerCommand(command: Constructable<ICommand>) {
        this.resolve(Command).register(command)
    }

    listen(opts: any = {}): Promise<HttpServer> {
        const app = this.resolve(Router).getApp()
        app.set('port', opts.port || 3000)

        const port = opts.port || process.env.PORT || '3000'
        const server = new HttpServer(app)

        server.on('error', err => {
            throw err
        })
        server.listen(port)
        return new Promise((resolve) => {
            server.on('listening', () => {
                console.log('Listening on port:' + port)
                resolve(server)
            })
        })
    }
}
