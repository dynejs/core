export function navigation({ hbs }) {
    return (collection: any, levels: number, options: any) => {
        if (!options) {
            options = levels
            levels = undefined
        }
        const children = function(input, level = 0) {
            if (!input || input.length === 0 || (levels !== undefined && level > levels)) {
                return ''
            }
            let out = `<ul class="menu menu-level-${level}">`
            input.map((page) => {
                const slug = page.slug || '#'
                out += `<li><a href="${slug}">${page.title}</a>
                    ${children(page.items, level + 1)}</li>`
            })
            out += '</ul>'
            return out
        }

        return new hbs.SafeString(children(collection))
    }
}
