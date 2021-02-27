export function breadcrumb({ hbs }) {
    return (options) => {
        const collection = options.data.root.collection
        const product = options.data.root.product
        if (!collection || !collection.parents || !Array.isArray(collection.parents)) {
            return
        }
        let ret = ''
        ret += '<ul class="breadcrumb">'
        ret += `<li class="breadcrumb-item"><a href="/">${hbs.handlebars.helpers.t('home')}</a></li>`
        for (const page of collection.parents) {
            ret = ret + `<li class="breadcrumb-item"><a href="${page.slug}">${page.title}</a></li>`
        }
        if (product) {
            ret += `<li class="breadcrumb-item"><a href="${collection.slug}">${collection.title}</a></li>`
            ret += `<li class="breadcrumb-item breadcrumb-item-active"><span>${product.title}</span></li>`
        } else {
            ret += `<li class="breadcrumb-item breadcrumb-item-active"><span>${collection.title}</span></li>`
        }
        ret += '</ul>'
        return new hbs.SafeString(ret)
    }
}
