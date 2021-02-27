import { IRouteDefinition } from '../router'


export function Controller() {
    return (target, method) => {}
}

export function Get(path: string, middleware = []) {
    return (target, handler) => {
        const request = getRequestType(target, handler)
        const routes = getRouteMeta(target)
        routes.push({
            method: 'get',
            cls: target.constructor,
            handler,
            middleware,
            path,
            request
        })
        setRouteMeta(target, routes)
    }
}

export function Post(path: string, middleware = []) {
    return (target, handler) => {
        const request = getRequestType(target, handler)
        const routes = getRouteMeta(target)
        routes.push({
            method: 'post',
            cls: target.constructor,
            handler,
            middleware,
            path,
            request
        })
        setRouteMeta(target, routes)
    }
}

export function Put(path: string, middleware = []) {
    return (target, handler) => {
        const routes = getRouteMeta(target)
        const request = getRequestType(target, handler)
        routes.push({
            method: 'put',
            cls: target.constructor,
            handler,
            middleware,
            path,
            request
        })
        setRouteMeta(target, routes)
    }
}

export function Delete(path: string, middleware = []) {
    return (target, handler) => {
        const routes = getRouteMeta(target)
        routes.push({
            method: 'delete',
            cls: target.constructor,
            handler,
            middleware,
            path,
        })
        setRouteMeta(target, routes)
    }
}

function getRouteMeta(target): IRouteDefinition[] {
    return Reflect.getMetadata('dy:routes', target.constructor) || []
}

function setRouteMeta(target, routes: IRouteDefinition[]) {
    Reflect.defineMetadata('dy:routes', routes, target.constructor)
}

function getRequestType(target, handler) {
    const params = Reflect.getMetadata('design:paramtypes', target, handler)
    if(params && params[0] && params[0].name !== 'Object') {
        return params[0]
    }
    return null
}
