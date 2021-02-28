import * as _debug from 'debug'

const debug = _debug('dyne:core:container')

export type Constructable<T> = (new (...args: any[]) => T)

export interface Binding<T> extends BindingOptions<T> {
    instance?: T
    resolved?: boolean
}

export interface BindingOptions<T> {
    cls: Constructable<T>
    deps: Constructable<any>[]
    singleton?: boolean
}

export type Callback = (resolved: any) => any

export class Container {
    services: Map<string, Binding<any>>

    //hooks: Map<string, Callback[]>

    constructor() {
        this.services = new Map()
        //this.hooks = new Map<string, Callback[]>()
        debug('Container initialized')
        this.services.set('Container', {
            cls: Container,
            instance: this,
            singleton: true,
            resolved: true,
            deps: []
        })
    }

    registerMany(services: Constructable<any>[]) {
        services.map(service => this.register(service))
    }

    register<T>(token: Constructable<T>)

    register<T>(token: Constructable<T>, deps: Constructable<any>[])

    register(token, deps?) {
        const id = this.getId(token)

        debug('Registering class: ' + id)

        const decoratorDeps = this.getDecoratorDeps(token)

        this.services.set(id, {
            cls: token,
            instance: null,
            deps: deps || decoratorDeps || [],
            resolved: false,
            singleton: true
        })
    }

    bind<T, P>(token: Constructable<T>, concrete: Constructable<P>, deps?: Constructable<any>[])

    bind<T>(token: string, concrete: Constructable<T>, deps?: Constructable<any>[])

    bind<T>(token, concrete, deps) {
        const id = this.getId(token)

        debug('Container binding with:' + id)

        const decoratorDeps = this.getDecoratorDeps(concrete)

        this.services.set(id, {
            cls: concrete,
            instance: null,
            deps: deps || decoratorDeps || [],
            resolved: false,
            singleton: true
        })
    }

    registerFn<T, P>(token: string | T, callback: () => P) {
        this.registerService(token, callback(), false, true)
    }

    private getDecoratorDeps(cls): Constructable<any>[] {
        return Reflect.getMetadata('design:paramtypes', cls)
    }

    private registerService(token, concrete, singleton = false, resolved = false) {
        if (typeof token === 'function') {
            if (!concrete) {
                concrete = token
            }

            token = token.name
        }

        this.services.set(token, {
            cls: concrete,
            instance: resolved ? concrete : null,
            deps: [],
            resolved: resolved,
            singleton: singleton
        })
    }

    private getId(token: string | Constructable<any>): string {
        if (typeof token === 'function') {
            return token.name
        }
        return token
    }

    resolve<T>(name: string | Constructable<T>): T {
        const cls = name

        if (typeof name === 'function') {
            name = name.name
        }

        const binding: Binding<T> = this.services.get(name)

        if (!binding && typeof cls === 'function') {
            const deps = this.getDecoratorDeps(cls) || []
            return this.createInstance(cls, deps)
        }

        if (!binding) {
            throw new Error(`Class ${name} not registered in the container`)
        }

        if (!binding.resolved) {
            const deps = binding.deps || []
            binding.instance = this.createInstance(binding.cls, deps)
        }

        if (binding.singleton) {
            binding.resolved = true
        }

        return binding.instance
    }

    invoke<T>(cls: any, method): any {
        const params = Reflect.getMetadata('design:paramtypes', cls, method) || []
        const resolvedParams = params.map(param => this.resolve(param))
        return cls[method].apply(cls, resolvedParams)
    }

    createInstance(cls: Constructable<any>, deps: any[]) {
        const params = this.getBindings(deps)
        return new cls(...params)
    }

    getBindings(bindings: Constructable<any>[]): Constructable<any>[] {
        if (!bindings) {
            return []
        }
        return bindings.map(name => this.resolve(name))
    }
}
