export function block({ hbs }) {
    return (name, options) => {
        if (!options.data.root._layout) {
            return ''
        }
        if (!options.data.root._layout[name]) {
            options.data.root._layout[name] = []
        }
        options.data.root._layout[name].push(options.fn(this))
    }
}

export function extend({ hbs }) {
    return (name, options) => {
        if (!options.data.root._layout) {
            return
        }
        options.data.root._layout.layout = name
    }
}

export function section({ hbs }) {
    return (name, options) => {
        if (!options.data.root_layout) {
            return
        }
        if (options.data.root._layout[name]) {
            return new hbs.SafeString(options.data.root._layout[name].join('\r\n'))
        }
        return ''
    }
}
