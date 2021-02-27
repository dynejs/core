export function t() {
    return (val, opts) => {
        if (!opts || String(val) === 'object' || !opts.data.root.t) return val

        return opts.data.root.t(val)
    }
}
