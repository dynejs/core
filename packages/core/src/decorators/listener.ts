export const LISTENER_METADATA = 'dy:listener'

export function Listener(event: string) {
    return (target) => {
        Reflect.defineMetadata(LISTENER_METADATA, { event }, target)
    }
}
