export function concat() {
    return (...args) => {
        args.pop()
        return (args || []).join('')
    }
}
