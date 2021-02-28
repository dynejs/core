export const COMMAND_METADATA = 'dy:command'

export function Command(signature: string) {
    return (target) => {
        Reflect.defineMetadata(COMMAND_METADATA, { signature }, target)
    }
}
