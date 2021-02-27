export function asset({hbs}) {
    return (location: string, options) => {
        if (options.data.root._assets[location]) {
            let lines = []
            options.data.root._assets[location].forEach((line) => {
                if (line.type === 'script') {
                    lines.push(`<script src="${line.path}" type="text/javascript"></script>`)
                }
                if (line.type === 'style') {
                    lines.push(`<link href="${line.path}" rel="stylesheet"/>`)
                }
            })
            return new hbs.SafeString(lines.join('\n\t'))
        }
    }
}
