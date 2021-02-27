import { Constructable } from '../types'

export function Injectable() {
    return (target: Constructable) => {}
}

export function Inject() {
    return (target, method) => {}
}

export function Service(opts?: any) {
    return (target, method) => {}
}
