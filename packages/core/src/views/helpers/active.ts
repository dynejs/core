export function active() {
    return (path, options) => {
        if (options.data._path === path) {
            return 'active'
        }
    }
}
