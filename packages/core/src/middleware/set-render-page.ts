export function setRenderPage() {
    return (req, res, next) => {
        res.renderPage = function(view, data, layout = 'index') {
            data = data || {}
            res.render(view, data, (err, html) => {
                if(err) return next(err)

                data.content = html

                res.render(layout, data)
            })
        }
        next()
    }
}
