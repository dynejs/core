export function head({ hbs }) {
    return (options) => {
        const lines = [
            '<meta charset="UTF-8">',
            '<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">',
            '<meta http-equiv="X-UA-Compatible" content="ie=edge">'
        ]
        if(options.data.root._assets.head) {
            options.data.root._assets.head.forEach(line => {
                lines.push(line)
            })
        }
        return new hbs.SafeString(lines.join('\n\t'))
    }
}

export function foot({ hbs }) {
    return (options) => {
        const lines = []
        if(options.data.root._assets.foot) {
            options.data.root._assets.foot.forEach(line => {
                lines.push(line)
            })
        }
        return new hbs.SafeString(lines.join('\n\t'))
    }
}

export function icon({ hbs }) {
    return (name, opts) => {
        if (!opts.data.root._icons) {
            return ''
        }
        return new hbs.SafeString(`<span class="icon">${opts.data.root._icons[name]}</span>`)
    }
}
