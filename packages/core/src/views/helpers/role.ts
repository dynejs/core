export function role() {
    return (role, opts) => {
        if (opts.data.root.user.role === role) {
            return opts.fn(this)
        }
        return opts.inverse(this)
    }
}
