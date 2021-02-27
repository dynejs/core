import * as url from 'url'

export function pagination({hbs}) {
    return (data, options) => {
        const currentUrl = options.data.root.currentUrl || ''
        const urlParams = options.data.root.currentUrlParams || {}
        const active = Number(urlParams.page) || 0

        let links = ''
        for (let i = 0; i < data.pages; i++) {
            const params = Object.assign(urlParams, {
                page: i
            })
            links += `<li class="${i === active ? 'active' : ''}">
                <a href="${currentUrl}?${new url.URLSearchParams(params).toString()}" class="pagination-link">${i + 1}</a>
            </li>`
        }

        return new hbs.SafeString(`<div class="pagination-wrapper"><ul class="pagination">${links}</ul></div>`)
    }
}
