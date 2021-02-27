export function setBasicLocals() {
    return (req, res, next) => {
        const old = req.flash('old')
        res.locals.user = req.user || null
        res.locals.old = old[0]
        res.locals.error = req.flash('error')
        res.locals.message = req.flash('message')
        next()
    }
}
